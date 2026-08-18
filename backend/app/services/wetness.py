import cv2
import numpy as np


def _normalize_exposure(frame: np.ndarray) -> np.ndarray:
    """
    CLAHE-based exposure normalization, applied BEFORE any wetness scoring.
    Root-cause fix for cross-image miscalibration: our three reference
    images had wildly different lighting (mean V of 132.8 / 81.7 / 124.1),
    so absolute brightness/saturation thresholds were measuring exposure,
    not wetness. Normalizing first means the same threshold means the same
    thing regardless of how the source photo/frame was lit.
    """
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def compute_wetness_score(frame: np.ndarray) -> dict:
    """
    Heuristic wetness estimate from a BGR frame (OpenCV default).
    Wet surfaces: darker, higher specular reflectance (bright highlights),
    and — once rain-streak noise is suppressed — smoother underlying
    surface texture. Desaturation is used as a supporting signal, but
    gated by brightness: naturally low-saturation surfaces (asphalt,
    concrete) are desaturated whether wet or dry, so desaturation alone
    is unreliable and must co-occur with a real brightness drop to count.
    Returns 0-100 score + component breakdown.
    """
    frame = _normalize_exposure(frame)
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    # 1. Brightness drop (wet asphalt is generally darker on average)
    mean_v = np.mean(v)
    brightness_score = np.clip((140 - mean_v) / 140 * 100, 0, 100)

    # 2. Specular highlights (small very-bright patches = reflection off water)
    _, bright_mask = cv2.threshold(v, 220, 255, cv2.THRESH_BINARY)
    specular_ratio = np.sum(bright_mask > 0) / bright_mask.size
    specular_score = np.clip(specular_ratio * 300, 0, 100)

    # 3. Texture variance of the UNDERLYING surface, not weather in front of it.
    # Median blur suppresses rain-streak/droplet noise before measuring
    # variance, so a heavily-raining frame doesn't falsely score as "textured"
    # (i.e. falsely dry) just because rain streaks are themselves noisy.
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    denoised = cv2.medianBlur(gray, 5)
    laplacian_var = cv2.Laplacian(denoised, cv2.CV_64F).var()
    texture_score = np.clip((150 - laplacian_var) / 150 * 100, 0, 100)

    # 4. Desaturation, GATED by brightness. Water sheen flattens surface
    # color, but naturally gray/low-chroma surfaces (asphalt, concrete) are
    # desaturated whether wet or dry — so raw desaturation alone falsely
    # fires on any dry gray road. Real wet surfaces are desaturated AND
    # darker; a bright, desaturated surface (dry asphalt in daylight) has
    # its desaturation contribution discounted accordingly.
    mean_sat = np.mean(s)
    raw_desaturation = np.clip((110 - mean_sat) / 110 * 100, 0, 100)
    darkness_gate = np.clip((140 - mean_v) / 140, 0.15, 1.0)
    desaturation_score = raw_desaturation * darkness_gate

    wetness = (
        0.30 * brightness_score
        + 0.25 * specular_score
        + 0.25 * texture_score
        + 0.20 * desaturation_score
    )
    wetness = float(np.clip(wetness, 0, 100))

    if wetness < 20:
        label = "Dry"
    elif wetness < 40:
        label = "Damp (light)"
    elif wetness < 70:
        label = "Damp/Wet"
    else:
        label = "Wet"

    return {
        "wetness_score": round(wetness, 1),
        "label": label,
        "components": {
            "brightness_score": round(float(brightness_score), 1),
            "specular_score": round(float(specular_score), 1),
            "texture_score": round(float(texture_score), 1),
            "desaturation_score": round(float(desaturation_score), 1),
        }
    }


def label_for_wetness(wetness: float) -> str:
    """
    Same thresholds as compute_wetness_score's internal labeling, but callable
    on any wetness value (e.g. the post-smoothing/post-fusion score) so the
    displayed label always matches whatever number it sits next to on screen.
    """
    if wetness < 20:
        return "Dry"
    elif wetness < 40:
        return "Damp (light)"
    elif wetness < 70:
        return "Damp/Wet"
    else:
        return "Wet"
