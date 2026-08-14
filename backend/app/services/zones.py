import numpy as np

# Zone boxes as fractions of frame (x1, y1, x2, y2), 0-1 normalized.
# Calibrate these per camera angle later — placeholder demo layout:
# racing line = bottom band, apex = center box, outer edge = top band
DEFAULT_ZONES = {
    "racing_line": (0.10, 0.70, 0.90, 0.95),
    "apex":        (0.35, 0.35, 0.65, 0.65),
    "outer_edge":  (0.05, 0.05, 0.95, 0.30),
}

def crop_zone(frame: np.ndarray, box: tuple) -> np.ndarray:
    h, w = frame.shape[:2]
    x1, y1, x2, y2 = box
    return frame[int(y1*h):int(y2*h), int(x1*w):int(x2*w)]

def get_zone_crops(frame: np.ndarray, zones: dict = None) -> dict:
    zones = zones or DEFAULT_ZONES
    return {name: crop_zone(frame, box) for name, box in zones.items()}
