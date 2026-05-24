"""Resolve page URLs to playable stream or snapshot sources."""

from __future__ import annotations

import html
import json
import logging
import re
import time
from dataclasses import dataclass
from typing import Optional
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)

EARTH_CAM_PAGE_RE = re.compile(r"https?://(?:www\.)?earthcam\.com/", re.I)
JSON_BASE_RE = re.compile(r"var\s+json_base\s*=\s*(?P<json>{.*?});", re.DOTALL)
TRAILING_CACHE_RE = re.compile(r"&\d{10,13}$")
R_CACHE_PARAM_RE = re.compile(r"([?&])r=\d+", re.I)

IP_CAMERA_PATH_PATTERNS = (
    re.compile(r"/cgi-bin/camera\b", re.I),
    re.compile(r"/cgi-bin/snapshot", re.I),
    re.compile(r"/cgi-bin/video\.cgi", re.I),
    re.compile(r"/cgi-bin/mjpg", re.I),
    re.compile(r"/videostream\.cgi", re.I),
    re.compile(r"/mjpeg", re.I),
    re.compile(r"/stream\.mjpg", re.I),
    re.compile(r"/axis-cgi/mjpg", re.I),
    re.compile(r"/video\.cgi", re.I),
    re.compile(r"/snap\.jpg", re.I),
    re.compile(r"/shot\.jpg", re.I),
    re.compile(r"/capture\.jpg", re.I),
    re.compile(r"/image\.jpg", re.I),
    re.compile(r"/jpeg\.jpg", re.I),
    re.compile(r"/snapshot\.jpg", re.I),
    re.compile(r"\.jpe?g$", re.I),
)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


@dataclass
class PlaybackSource:
    mode: str  # "hls", "streamlink", "snapshot", "ip_snapshot", "mjpeg"
    source: str
    label: str = "LIVE"


def normalize_stream_url(url: str) -> str:
    """Decode HTML entities (&amp;) and trim."""
    return html.unescape((url or "").strip())


def refresh_ip_camera_url(url: str) -> str:
    """
    Refresh cache-buster on IP camera URLs, e.g.
    .../camera?resolution=640&quality=1&Language=0&1779661756
    .../snap.jpg?JpegSize=M&JpegCam=1&r=1779662550
    """
    url = normalize_stream_url(url)
    ts = str(int(time.time()))

    if R_CACHE_PARAM_RE.search(url):
        return R_CACHE_PARAM_RE.sub(rf"\1r={ts}", url, count=1)

    if TRAILING_CACHE_RE.search(url):
        return TRAILING_CACHE_RE.sub(f"&{ts}", url)

    parsed = urlparse(url)
    if not parsed.query:
        sep = "?"
    else:
        sep = "&"
    return f"{url}{sep}{ts}"


def _is_ip_camera_url(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False

    path = parsed.path or ""
    for pattern in IP_CAMERA_PATH_PATTERNS:
        if pattern.search(path):
            return True

    host = parsed.hostname or ""
    if re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", host) and "camera" in path.lower():
        return True

    return False


def _is_jpeg_snapshot_path(path: str) -> bool:
    lower = path.lower()
    if re.search(r"\.jpe?g$", lower):
        return True
    return bool(
        re.search(
            r"/(?:snap|shot|capture|image|jpeg|snapshot)\.jpg",
            lower,
        )
    )


def _probe_content_type(url: str) -> str | None:
    """GET only — many IP cameras return 400 on HEAD."""
    headers = {"User-Agent": USER_AGENT, "Accept": "image/*,*/*"}
    try:
        request = Request(url, headers=headers, method="GET")
        with urlopen(request, timeout=10) as response:
            return (response.headers.get("Content-Type") or "").lower()
    except Exception as exc:
        logger.debug("Probe GET failed for %s: %s", url, exc)
    return None


def _fetch_page(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
    with urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


def _parse_earthcam(page_url: str, html_text: str) -> Optional[dict]:
    match = JSON_BASE_RE.search(html_text)
    if not match:
        return None

    data = json.loads(match.group("json"))
    cams = data.get("cam") or {}
    if not cams:
        return None

    query_cam = parse_qs(urlparse(page_url).query).get("cam", [None])[0]
    cam_name = query_cam or next(iter(cams.keys()), None)
    if not cam_name:
        return None

    cam = cams.get(cam_name)
    if not cam:
        return None

    domain = (cam.get("html5_streamingdomain") or "").rstrip("/")
    path = cam.get("html5_streampath") or cam.get("livestreamingpath") or ""
    hls_url = cam.get("stream") or (f"{domain}{path}" if domain and path else None)

    thumb = (
        cam.get("thumbimage")
        or cam.get("thumbnail_512")
        or cam.get("thumbnail_256")
        or cam.get("offlineimage")
    )

    is_live = cam.get("liveon") == "true" and cam.get("cam_state") == "1"
    title = cam.get("title") or cam_name

    return {
        "hls_url": hls_url,
        "thumb_url": thumb,
        "is_live": is_live,
        "title": title,
        "defaulttab": cam.get("defaulttab"),
    }


def resolve_ip_camera_url(url: str) -> PlaybackSource:
    """Resolve direct IP camera HTTP URLs (cgi-bin/camera, snap.jpg, MJPEG, etc.)."""
    url = normalize_stream_url(url)
    path = urlparse(url).path or ""

    if _is_jpeg_snapshot_path(path):
        return PlaybackSource(mode="ip_snapshot", source=url, label="LIVE")

    probe_url = refresh_ip_camera_url(url)
    content_type = _probe_content_type(probe_url) or ""

    if "multipart" in content_type or "mjpeg" in content_type:
        return PlaybackSource(mode="mjpeg", source=url, label="LIVE")

    if "image/jpeg" in content_type or "image/jpg" in content_type:
        return PlaybackSource(mode="ip_snapshot", source=url, label="LIVE")

    return PlaybackSource(mode="ip_snapshot", source=url, label="LIVE")


def resolve_playback_url(page_url: str) -> PlaybackSource:
    """
    EarthCam pages → HLS/snapshot.
    IP cameras (cgi-bin/camera, MJPEG) → ip_snapshot or mjpeg.
    Other URLs → streamlink.
    """
    page_url = normalize_stream_url(page_url)

    if EARTH_CAM_PAGE_RE.match(page_url):
        try:
            html_text = _fetch_page(page_url)
            meta = _parse_earthcam(page_url, html_text)
        except Exception as exc:
            logger.warning("EarthCam parse failed for %s: %s", page_url, exc)
            meta = None

        if meta:
            if meta["is_live"] and meta["hls_url"]:
                return PlaybackSource(mode="hls", source=meta["hls_url"], label="LIVE")

            if meta["thumb_url"]:
                label = "OFFLINE" if not meta["is_live"] else "SNAPSHOT"
                return PlaybackSource(
                    mode="snapshot",
                    source=meta["thumb_url"],
                    label=label,
                )

            if meta["hls_url"]:
                return PlaybackSource(mode="hls", source=meta["hls_url"], label="LIVE")

    if _is_ip_camera_url(page_url):
        return resolve_ip_camera_url(page_url)

    return PlaybackSource(mode="streamlink", source=page_url, label="LIVE")
