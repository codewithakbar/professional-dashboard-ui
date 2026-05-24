"""Async recording history — never blocks live stream or YOLO detection."""

from __future__ import annotations

import logging
import queue
import threading
import time

from django.utils import timezone

from .models import Camera, DetectionLog

logger = logging.getLogger(__name__)

LOG_INTERVAL_SEC = 25
_LOG_QUEUE: queue.Queue[tuple[str, int] | None] = queue.Queue(maxsize=64)
_state_lock = threading.Lock()
_last_log_state: dict[str, tuple[float, int]] = {}
_worker_lock = threading.Lock()
_worker_started = False


def _reserve_log_slot(camera_id: str, person_count: int) -> bool:
    """Fast in-memory throttle; avoids queueing redundant DB writes."""
    now = time.time()
    with _state_lock:
        last_time, last_count = _last_log_state.get(camera_id, (0.0, -1))
        count_changed = person_count != last_count
        interval_passed = (now - last_time) >= LOG_INTERVAL_SEC
        if not count_changed and not interval_passed:
            return False
        _last_log_state[camera_id] = (now, person_count)
        return True


def _persist_log(camera_id: str, person_count: int) -> None:
    try:
        camera = Camera.objects.get(pk=int(camera_id))
    except Camera.DoesNotExist:
        return

    DetectionLog.objects.create(camera=camera, person_count=person_count)
    Camera.objects.filter(pk=camera.pk).update(last_recording=timezone.now())


def _worker_loop() -> None:
    while True:
        item = _LOG_QUEUE.get()
        try:
            if item is None:
                return
            camera_id, person_count = item
            _persist_log(camera_id, person_count)
        except Exception as exc:
            logger.warning("Detection history worker error: %s", exc)
        finally:
            _LOG_QUEUE.task_done()


def _ensure_worker() -> None:
    global _worker_started
    with _worker_lock:
        if _worker_started:
            return
        thread = threading.Thread(target=_worker_loop, name="detection-history", daemon=True)
        thread.start()
        _worker_started = True


def schedule_log_detection(
    camera_id: str,
    person_count: int,
    *,
    ai_active: bool,
    ai_enabled: bool,
) -> None:
    """Queue a DB write on a background thread (non-blocking)."""
    if not ai_enabled or not ai_active:
        return
    if not _reserve_log_slot(camera_id, person_count):
        return

    _ensure_worker()
    try:
        _LOG_QUEUE.put_nowait((camera_id, person_count))
    except queue.Full:
        logger.debug("Detection log queue full, skipping camera %s", camera_id)
