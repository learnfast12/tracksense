import cv2
import numpy as np

def compute_wetness_score(frame: np.ndarray) -> dict:
    """
    Heuristic wetness estimate from a BGR frame (OpenCV default).
    Wet surfaces: darker, higher specular reflectance (bright highlights),
    lower saturation variance (water flattens texture).
    Returns 0-100 score + component breakdown.
    """
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    # 1. Brightness drop (wet asphalt is generally darker on average)
    mean_v = np.mean(v)
    brightness_score = np.clip((140 - mean_v) / 140 * 100, 0, 100)

    # 2. Specular highlights (small very-bright patches = reflection off water)
    _, bright_mask = cv2.threshold(v, 220, 255, cv2.THRESH_BINARY)
    specular_ratio = np.sum(bright_mask > 0) / bright_mask.size
    specular_score = np.clip(specular_ratio * 500, 0, 100)

    # 3. Texture variance (wet = smoother/flatter local variance)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    texture_score = np.clip((150 - laplacian_var) / 150 * 100, 0, 100)

    wetness = (0.4 * brightness_score) + (0.35 * specular_score) + (0.25 * texture_score)
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
        }
    }
