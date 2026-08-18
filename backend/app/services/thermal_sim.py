import cv2
import numpy as np

def simulate_thermal_score(frame: np.ndarray) -> float:
    """
    Synthetic reflectance/thermal proxy — deliberately reads a DIFFERENT
    channel than the vision classifier (wetness.py uses V-brightness +
    grayscale texture; this uses HSV Saturation). Water sheen desaturates
    and flattens surface color, which is a genuine independent wetness cue —
    BUT desaturation alone is unreliable on surfaces that are naturally
    low-saturation regardless of wetness (asphalt, concrete, gray gravel).
    A bone-dry gray road and a soaked gray road can have near-identical
    saturation, so raw desaturation false-positives on any gray surface.

    Fix: gate desaturation by brightness drop. Real wet surfaces are BOTH
    desaturated AND darker (water absorbs/redirects light away from the
    camera rather than diffusely scattering it like dry matte material).
    A surface that's desaturated but NOT dark (e.g. dry asphalt in daylight)
    gets its desaturation contribution scaled down accordingly.
    Returns 0-100 wetness proxy score.
    """
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    _, s, v = cv2.split(hsv.astype(np.float32))

    mean_sat = np.mean(s)
    desaturation = np.clip((110 - mean_sat) / 110 * 100, 0, 100)

    sat_variance = np.var(s)
    flatness = np.clip((900 - sat_variance) / 900 * 100, 0, 100)

    # Brightness-gate: only count desaturation/flatness fully when the
    # surface is also darker than a typical dry-daylight surface (~140).
    # Bright + desaturated (dry gray asphalt in sun) gets heavily discounted.
    mean_v = np.mean(v)
    darkness_gate = np.clip((140 - mean_v) / 140, 0.15, 1.0)  # floor at 0.15, never fully zero out

    score = (0.6 * desaturation + 0.4 * flatness) * darkness_gate
    return round(float(np.clip(score, 0, 100)), 1)
