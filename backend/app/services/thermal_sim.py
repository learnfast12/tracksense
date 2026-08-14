import cv2
import numpy as np

def simulate_thermal_score(frame: np.ndarray) -> float:
    """
    Synthetic reflectance/thermal proxy — deliberately reads a DIFFERENT
    channel than the vision classifier (wetness.py uses V-brightness +
    grayscale texture; this uses HSV Saturation). Water sheen desaturates
    and flattens surface color, which is a genuine independent wetness cue
    that works regardless of ambient light color — unlike a raw blue-channel
    metric, which reads near-zero on any warm-toned surface (wood, asphalt
    under tungsten light, etc.) no matter how wet it actually is.
    Returns 0-100 wetness proxy score.
    """
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    _, s, _ = cv2.split(hsv.astype(np.float32))

    # Desaturation: wet surfaces wash out toward gray/white sheen
    mean_sat = np.mean(s)  # 0-255
    desaturation = np.clip((110 - mean_sat) / 110 * 100, 0, 100)

    # Saturation flatness: wet = more uniform color across the surface,
    # same principle as the texture cue in wetness.py but on color, not luma
    sat_variance = np.var(s)
    flatness = np.clip((900 - sat_variance) / 900 * 100, 0, 100)

    score = 0.6 * desaturation + 0.4 * flatness
    return round(float(np.clip(score, 0, 100)), 1)
