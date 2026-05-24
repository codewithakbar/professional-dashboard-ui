"""YOLO-based person detection for live camera frames."""

from __future__ import annotations

import logging
import threading
from dataclasses import dataclass, field

import cv2
import numpy as np

logger = logging.getLogger(__name__)

PERSON_CLASS_ID = 0
_model = None
_model_lock = threading.Lock()

# Crowd-friendly defaults (many people in one frame)
DEFAULT_CONF = 0.22
DEFAULT_IMGSZ = 960
DEFAULT_IOU = 0.45
MAX_DETECTIONS = 300


@dataclass
class DetectionResult:
    person_count: int = 0
    boxes: list[tuple[int, int, int, int]] = field(default_factory=list)


def get_yolo_model():
    global _model
    with _model_lock:
        if _model is None:
            from ultralytics import YOLO

            logger.info("Loading YOLOv8s for person detection...")
            _model = YOLO("yolov8s.pt")
            logger.info("YOLO model ready.")
        return _model


def detect_persons(
    frame: np.ndarray,
    conf: float = DEFAULT_CONF,
    imgsz: int = DEFAULT_IMGSZ,
) -> DetectionResult:
    model = get_yolo_model()
    results = model.predict(
        frame,
        verbose=False,
        classes=[PERSON_CLASS_ID],
        conf=conf,
        iou=DEFAULT_IOU,
        imgsz=imgsz,
        max_det=MAX_DETECTIONS,
        device="cpu",
    )

    boxes: list[tuple[int, int, int, int]] = []
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            w, h = x2 - x1, y2 - y1
            if w < 8 or h < 16:
                continue
            boxes.append((x1, y1, x2, y2))

    return DetectionResult(person_count=len(boxes), boxes=boxes)


def annotate_frame(
    frame: np.ndarray,
    detection: DetectionResult,
    status_label: str = "LIVE",
) -> np.ndarray:
    output = frame.copy()
    h, w = output.shape[:2]

    for i, (x1, y1, x2, y2) in enumerate(detection.boxes, start=1):
        cv2.rectangle(output, (x1, y1), (x2, y2), (0, 230, 0), 2)
        cv2.putText(
            output,
            str(i),
            (x1 + 4, max(y1 + 18, 18)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 30, 0),
            2,
        )

    count = detection.person_count
    count_text = f"People: {count}"

    cv2.putText(output, status_label, (16, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.95, (0, 0, 255), 2)
    cv2.putText(output, count_text, (16, 78), cv2.FONT_HERSHEY_SIMPLEX, 0.95, (0, 255, 120), 2)

    badge = count_text
    (tw, th), _ = cv2.getTextSize(badge, cv2.FONT_HERSHEY_SIMPLEX, 0.85, 2)
    bx2 = w - 16
    by1 = 28
    bx1 = bx2 - tw - 14
    cv2.rectangle(output, (bx1, by1 - th - 10), (bx2, by1 + 6), (0, 0, 0), -1)
    cv2.putText(output, badge, (bx1 + 7, by1), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (0, 255, 120), 2)

    return output


def annotate_frame_plain(frame: np.ndarray, status_label: str = "LIVE") -> np.ndarray:
    """Stream frame without YOLO boxes (AI detection off)."""
    output = frame.copy()
    cv2.putText(output, status_label, (16, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.95, (0, 0, 255), 2)
    return output
