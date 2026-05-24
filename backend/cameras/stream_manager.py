import subprocess
import threading
import numpy as np
import cv2
import time
import logging
from urllib.request import Request, urlopen

from .detection_logger import schedule_log_detection
from .stream_resolver import (
    PlaybackSource,
    refresh_ip_camera_url,
    resolve_playback_url,
)
from .person_detector import DetectionResult, annotate_frame, annotate_frame_plain, detect_persons

logger = logging.getLogger(__name__)

FFMPEG_HEADERS = "Referer: https://www.earthcam.com/\r\nOrigin: https://www.earthcam.com\r\n"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
# Full HD live output (1920×1080)
FRAME_WIDTH, FRAME_HEIGHT = 1920, 1080
FRAME_SIZE = FRAME_WIDTH * FRAME_HEIGHT * 3
FRAME_SCALE_VF = f"scale={FRAME_WIDTH}:{FRAME_HEIGHT}"

# 1× real-time playback (not faster than source)
PLAYBACK_FPS = 25
OUTPUT_FPS = PLAYBACK_FPS
FRAME_INTERVAL_SEC = 1.0 / PLAYBACK_FPS
DETECTION_INTERVAL_SEC = 0.12
JPEG_QUALITY = 85


def _ffmpeg_pipe_decode(stdin) -> subprocess.Popen:
    """Decode streamlink stdout → Full HD raw BGR frames (real-time)."""
    return subprocess.Popen(
        [
            "ffmpeg",
            "-re",
            "-i",
            "pipe:0",
            "-vf",
            FRAME_SCALE_VF,
            "-r",
            str(PLAYBACK_FPS),
            "-f",
            "rawvideo",
            "-pix_fmt",
            "bgr24",
            "-",
        ],
        stdin=stdin,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )


def _ffmpeg_url_decode(
    url: str,
    *,
    low_latency: bool = True,
    earthcam_headers: bool = False,
) -> subprocess.Popen:
    """Decode HLS/MJPEG/HTTP URL → Full HD raw BGR frames."""
    cmd = ["ffmpeg", "-re"]
    if low_latency:
        cmd.extend(["-fflags", "nobuffer", "-flags", "low_delay"])
    cmd.extend(["-user_agent", USER_AGENT])
    if earthcam_headers:
        cmd.extend(["-headers", FFMPEG_HEADERS])
    cmd.extend(
        [
            "-i",
            url,
            "-vf",
            FRAME_SCALE_VF,
            "-r",
            str(PLAYBACK_FPS),
            "-f",
            "rawvideo",
            "-pix_fmt",
            "bgr24",
            "-",
        ]
    )
    return subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)


def _extract_jpeg_bytes(data: bytes) -> bytes | None:
    """Extract a single JPEG from raw bytes or multipart chunk."""
    start = data.find(b"\xff\xd8")
    if start < 0:
        return None
    end = data.find(b"\xff\xd9", start)
    if end > start:
        return data[start : end + 2]
    return data[start:]


class ActiveStream:
    """
    Three-thread pipeline for smooth real-time output:
    - Capture: read frames from source (always latest frame only)
    - Detection: YOLO async, never blocks capture/encode
    - Encode: steady FPS with last boxes drawn on every frame
    """

    def __init__(self, camera_id: str, url: str):
        self.camera_id = camera_id
        self.url = url
        self.playback: PlaybackSource | None = None
        self.latest_frame_jpeg: bytes | None = None
        self.latest_raw_frame: np.ndarray | None = None
        self.cached_detection = DetectionResult()
        self.person_count = 0
        self.last_detection_at: float | None = None
        self.ai_detection_enabled = True
        self.status_label = "LIVE"
        self.last_requested_time = time.time()
        self.stop_event = threading.Event()
        self.raw_lock = threading.Lock()
        self.output_lock = threading.Lock()
        self.detection_lock = threading.Lock()
        self.capture_thread = None
        self.detection_thread = None
        self.encode_thread = None

    def start(self):
        self.capture_thread = threading.Thread(target=self._run_capture, daemon=True)
        self.detection_thread = threading.Thread(target=self._run_detection, daemon=True)
        self.encode_thread = threading.Thread(target=self._run_encode, daemon=True)
        self.capture_thread.start()
        self.detection_thread.start()
        self.encode_thread.start()

    def stop(self):
        self.stop_event.set()
        for thread in (self.capture_thread, self.detection_thread, self.encode_thread):
            if thread and thread.is_alive():
                thread.join(timeout=2)
        logger.info("Stream for camera %s stopped.", self.camera_id)

    def get_stats(self) -> dict:
        with self.detection_lock:
            return {
                "person_count": self.person_count if self.ai_detection_enabled else 0,
                "last_detection_at": self.last_detection_at if self.ai_detection_enabled else None,
            }

    def set_ai_detection_enabled(self, enabled: bool) -> None:
        with self.detection_lock:
            self.ai_detection_enabled = enabled
            if not enabled:
                self.cached_detection = DetectionResult()
                self.person_count = 0
                self.last_detection_at = None

    def _set_raw_frame(self, frame: np.ndarray) -> None:
        h, w = frame.shape[:2]
        if w != FRAME_WIDTH or h != FRAME_HEIGHT:
            frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
        with self.raw_lock:
            self.latest_raw_frame = frame

    def _get_raw_frame(self) -> np.ndarray | None:
        with self.raw_lock:
            if self.latest_raw_frame is None:
                return None
            return self.latest_raw_frame.copy()

    def _get_detection_copy(self) -> DetectionResult:
        with self.detection_lock:
            return DetectionResult(
                person_count=self.cached_detection.person_count,
                boxes=list(self.cached_detection.boxes),
            )

    def _run_detection(self) -> None:
        while not self.stop_event.is_set():
            if not self.ai_detection_enabled:
                time.sleep(DETECTION_INTERVAL_SEC)
                continue
            frame = self._get_raw_frame()
            if frame is not None:
                try:
                    detection = detect_persons(frame)
                    with self.detection_lock:
                        self.cached_detection = detection
                        self.person_count = detection.person_count
                        self.last_detection_at = time.time()
                except Exception as exc:
                    logger.warning("AI detection failed for camera %s: %s", self.camera_id, exc)
                else:
                    try:
                        schedule_log_detection(
                            self.camera_id,
                            detection.person_count,
                            ai_active=True,
                            ai_enabled=self.ai_detection_enabled,
                        )
                    except Exception as exc:
                        logger.warning(
                            "Detection history log failed for camera %s: %s",
                            self.camera_id,
                            exc,
                        )
            time.sleep(DETECTION_INTERVAL_SEC)

    def _read_ffmpeg_frames(self, stdout) -> None:
        """Read decoded frames at 1× speed (wall-clock paced)."""
        next_frame_at = time.monotonic()
        while not self.stop_event.is_set():
            raw = stdout.read(FRAME_SIZE)
            if not raw or len(raw) < FRAME_SIZE:
                break
            frame = np.frombuffer(raw, dtype=np.uint8).reshape(
                (FRAME_HEIGHT, FRAME_WIDTH, 3)
            )
            self._set_raw_frame(frame)

            next_frame_at += FRAME_INTERVAL_SEC
            delay = next_frame_at - time.monotonic()
            if delay > 0:
                time.sleep(delay)
            else:
                # Lag behind — drop catch-up bursts so motion stays 1×
                next_frame_at = time.monotonic()

    def _run_encode(self) -> None:
        interval = FRAME_INTERVAL_SEC
        while not self.stop_event.is_set():
            loop_start = time.time()
            frame = self._get_raw_frame()
            if frame is not None:
                if self.ai_detection_enabled:
                    detection = self._get_detection_copy()
                    annotated = annotate_frame(frame, detection, self.status_label)
                else:
                    annotated = annotate_frame_plain(frame, self.status_label)
                h, w = annotated.shape[:2]
                display = (
                    annotated
                    if w == FRAME_WIDTH and h == FRAME_HEIGHT
                    else cv2.resize(annotated, (FRAME_WIDTH, FRAME_HEIGHT))
                )
                ok, jpeg_buffer = cv2.imencode(
                    ".jpg",
                    display,
                    [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY],
                )
                if ok:
                    with self.output_lock:
                        self.latest_frame_jpeg = jpeg_buffer.tobytes()

            elapsed = time.time() - loop_start
            time.sleep(max(0.0, interval - elapsed))

    def _run_capture(self) -> None:
        self.playback = resolve_playback_url(self.url)
        logger.info(
            "Camera %s: %s -> %s (%s)",
            self.camera_id,
            self.url,
            self.playback.mode,
            self.playback.source[:120],
        )
        self.status_label = self.playback.label

        if self.playback.mode == "snapshot":
            self._capture_snapshot(self.playback)
        elif self.playback.mode == "ip_snapshot":
            self._capture_ip_snapshot(self.playback)
        elif self.playback.mode == "mjpeg":
            self._capture_mjpeg(self.playback)
        elif self.playback.mode == "hls":
            self._capture_hls(self.playback)
        else:
            self._capture_streamlink(self.playback)

    def _capture_snapshot(self, playback: PlaybackSource) -> None:
        while not self.stop_event.is_set():
            try:
                request = Request(
                    playback.source,
                    headers={"User-Agent": USER_AGENT, "Referer": "https://www.earthcam.com/"},
                )
                with urlopen(request, timeout=15) as response:
                    data = response.read()
                arr = np.frombuffer(data, dtype=np.uint8)
                frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                if frame is not None:
                    self._set_raw_frame(frame)
            except Exception as exc:
                logger.error("Snapshot error for camera %s: %s", self.camera_id, exc)
            time.sleep(8)

    def _capture_ip_snapshot(self, playback: PlaybackSource) -> None:
        """Poll IP cameras that return a single JPEG per request (cgi-bin/camera, etc.)."""
        interval = 1.0 / min(PLAYBACK_FPS, 10)

        while not self.stop_event.is_set():
            loop_start = time.time()
            frame_url = refresh_ip_camera_url(playback.source)
            try:
                request = Request(
                    frame_url,
                    headers={"User-Agent": USER_AGENT, "Accept": "image/*,*/*"},
                )
                with urlopen(request, timeout=20) as response:
                    data = response.read()
                jpeg = _extract_jpeg_bytes(data)
                if not jpeg:
                    time.sleep(interval)
                    continue
                arr = np.frombuffer(jpeg, dtype=np.uint8)
                frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                if frame is not None:
                    self._set_raw_frame(frame)
            except Exception as exc:
                logger.warning("IP camera snapshot error for %s: %s", self.camera_id, exc)

            loop_elapsed = time.time() - loop_start
            time.sleep(max(0.0, interval - loop_elapsed))

    def _capture_mjpeg(self, playback: PlaybackSource) -> None:
        stream_url = refresh_ip_camera_url(playback.source)
        ffmpeg = _ffmpeg_url_decode(stream_url, earthcam_headers=False)

        try:
            self._read_ffmpeg_frames(ffmpeg.stdout)
        except Exception as exc:
            logger.error("MJPEG error for camera %s: %s", self.camera_id, exc)
        finally:
            ffmpeg.terminate()
            try:
                ffmpeg.wait(timeout=1)
            except Exception:
                pass

    def _capture_hls(self, playback: PlaybackSource) -> None:
        ffmpeg = _ffmpeg_url_decode(playback.source, earthcam_headers=True)

        try:
            self._read_ffmpeg_frames(ffmpeg.stdout)
        except Exception as exc:
            logger.error("HLS error for camera %s: %s", self.camera_id, exc)
        finally:
            ffmpeg.terminate()
            try:
                ffmpeg.wait(timeout=1)
            except Exception:
                pass

        if "earthcam.com" in self.url and not self.stop_event.is_set():
            fallback = resolve_playback_url(self.url)
            if fallback.mode == "snapshot":
                self._capture_snapshot(fallback)

    def _capture_streamlink(self, playback: PlaybackSource) -> None:
        stream = subprocess.Popen(
            ["streamlink", "--stdout", playback.source, "best"],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        ffmpeg = _ffmpeg_pipe_decode(stream.stdout)
        if stream.stdout:
            stream.stdout.close()

        try:
            self._read_ffmpeg_frames(ffmpeg.stdout)
        except Exception as exc:
            logger.error("Streamlink error for camera %s: %s", self.camera_id, exc)
        finally:
            ffmpeg.terminate()
            stream.terminate()
            try:
                ffmpeg.wait(timeout=1)
                stream.wait(timeout=1)
            except Exception:
                pass


class StreamManager:
    def __init__(self):
        self.streams = {}
        self.lock = threading.Lock()

        self.cleanup_thread = threading.Thread(
            target=self._cleanup_inactive_streams, daemon=True
        )
        self.cleanup_thread.start()

    def get_frame(self, camera_id: str, url: str, ai_detection_enabled: bool = True) -> bytes | None:
        with self.lock:
            existing = self.streams.get(camera_id)
            if existing and existing.url != url:
                existing.stop()
                del self.streams[camera_id]

            if camera_id not in self.streams:
                stream = ActiveStream(camera_id, url)
                stream.ai_detection_enabled = ai_detection_enabled
                stream.start()
                self.streams[camera_id] = stream

            stream = self.streams[camera_id]
            if stream.ai_detection_enabled != ai_detection_enabled:
                stream.set_ai_detection_enabled(ai_detection_enabled)
            stream.last_requested_time = time.time()

        with stream.output_lock:
            return stream.latest_frame_jpeg

    def get_detection_stats(
        self,
        camera_id: str,
        ai_detection_enabled: bool = True,
    ) -> dict:
        """Read cached YOLO stats only — does not touch encode pipeline or JPEG output."""
        with self.lock:
            stream = self.streams.get(camera_id)
            if not stream:
                return {
                    "person_count": 0,
                    "last_detection_at": None,
                    "ai_active": False,
                    "ai_enabled": ai_detection_enabled,
                }
            stream.last_requested_time = time.time()
            if stream.ai_detection_enabled != ai_detection_enabled:
                stream.set_ai_detection_enabled(ai_detection_enabled)
            stats = stream.get_stats()
            stats["ai_active"] = (
                ai_detection_enabled and stream.last_detection_at is not None
            )
            stats["ai_enabled"] = ai_detection_enabled
            return stats

    def _cleanup_inactive_streams(self):
        while True:
            time.sleep(5)
            now = time.time()
            inactive_ids = []
            with self.lock:
                for cid, stream in self.streams.items():
                    if now - stream.last_requested_time > 15:
                        inactive_ids.append(cid)

                for cid in inactive_ids:
                    stream = self.streams.pop(cid)
                    stream.stop()


stream_manager = StreamManager()
