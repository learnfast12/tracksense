import time
from collections import deque
from typing import Dict, Deque, Tuple

# Rolling buffer per zone: list of (timestamp, wetness_score)
BUFFER_MAXLEN = 60  # ~last 60 readings per zone
_history: Dict[str, Deque[Tuple[float, float]]] = {}

def record_reading(zone: str, wetness_score: float):
    if zone not in _history:
        _history[zone] = deque(maxlen=BUFFER_MAXLEN)
    _history[zone].append((time.time(), wetness_score))

def get_trend(zone: str) -> dict:
    hist = _history.get(zone)
    if not hist or len(hist) < 2:
        return {"direction": "stable", "velocity": 0.0, "confidence": 0.0}

    times = [t for t, _ in hist]
    scores = [s for _, s in hist]

    dt_minutes = (times[-1] - times[0]) / 60.0
    if dt_minutes <= 0:
        return {"direction": "stable", "velocity": 0.0, "confidence": 0.0}

    velocity = (scores[-1] - scores[0]) / dt_minutes  # pts/min

    if velocity < -1.0:
        direction = "drying"
    elif velocity > 1.0:
        direction = "wetting"
    else:
        direction = "stable"

    # crude stability confidence: inverse of local variance
    diffs = [abs(scores[i] - scores[i-1]) for i in range(1, len(scores))]
    avg_noise = sum(diffs) / len(diffs) if diffs else 0
    confidence = max(0.0, min(100.0, 100 - avg_noise * 5))

    return {
        "direction": direction,
        "velocity": round(velocity, 2),
        "confidence": round(confidence, 1),
    }

def get_all_trends() -> dict:
    return {zone: get_trend(zone) for zone in _history}
