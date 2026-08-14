import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.wetness import compute_wetness_score
from app.services.zones import get_zone_crops
from app.services.trend import record_reading, get_trend
from app.services.thermal_sim import simulate_thermal_score
from app.services.fusion import fuse_signals
from app.services.strategy import get_tyre_strategy
from app.services.smoothing import smooth

router = APIRouter()

@router.post("/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    contents = await file.read()
    npimg = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    zone_crops = get_zone_crops(frame)
    zone_results = {}
    scores = []

    for name, crop in zone_crops.items():
        if crop.size == 0:
            continue

        result = compute_wetness_score(crop)
        raw_thermal = simulate_thermal_score(crop)

        # Smooth both raw signals before fusion — kills frame-to-frame
        # sensor/lighting noise while still tracking real trend changes.
        smoothed_vision = smooth(f"{name}_vision", result["wetness_score"])
        smoothed_thermal = smooth(f"{name}_thermal", raw_thermal)

        fusion = fuse_signals(smoothed_vision, smoothed_thermal)
        record_reading(name, fusion["fused_wetness"])
        trend = get_trend(name)

        zone_results[name] = {
            "wetness_score": smoothed_vision,
            "label": result["label"],
            "thermal_score": smoothed_thermal,
            "fusion": fusion,
            "trend": trend,
        }
        scores.append(fusion["fused_wetness"])

    overall = round(sum(scores) / len(scores), 1) if scores else 0.0
    overall_label = "Dry" if overall < 20 else "Damp" if overall < 70 else "Wet"

    racing_line_trend = zone_results.get("racing_line", {}).get("trend", {"direction": "stable", "velocity": 0.0})
    avg_confidence = round(sum(z["fusion"]["confidence"] for z in zone_results.values()) / len(zone_results), 1) if zone_results else 0.0

    strategy = get_tyre_strategy(
        overall_wetness=overall,
        trend_direction=racing_line_trend["direction"],
        trend_velocity=racing_line_trend["velocity"],
        confidence=avg_confidence,
    )

    return {
        "zones": zone_results,
        "overall_wetness": overall,
        "overall_label": overall_label,
        "strategy": strategy,
    }
