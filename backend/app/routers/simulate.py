"""
Trend-engine demo mode. Feeds a scripted, clearly-labeled synthetic wetness
CURVE through the same real record_reading -> get_trend -> get_tyre_strategy
pipeline used by live analysis. No vision/image scoring involved here at all -
this exists purely to demo the temporal trend + strategy engine on demand,
without needing a live drying event to happen in front of judges.

Every response is tagged "simulated": true so the frontend can (and should)
show a clear on-screen label - this is not disguised as live camera output.
"""
import time
from fastapi import APIRouter
from app.services.trend import get_trend
from app.services import trend as trend_module
from app.services.strategy import get_tyre_strategy

router = APIRouter()

# A believable drying arc: starts wet, dries out over the sequence.
# Feel free to edit this curve directly to change the story the demo tells.
DEMO_CURVE = [78, 74, 69, 63, 58, 51, 45, 38, 32, 27, 23, 19]

# Fixed fake time gap between scripted points (seconds), so velocity math
# reflects the STORY we're telling, not however fast you happen to hit curl.
# 45s/step -> a full 12-step sequence spans ~9 simulated minutes.
SIMULATED_STEP_SECONDS = 45

_ZONE = "racing_line_SIMULATED"


@router.post("/simulate/reset")
def simulate_reset():
    trend_module._history.pop(_ZONE, None)
    return {"status": "reset", "zone": _ZONE}


@router.post("/simulate/step")
def simulate_step(index: int):
    """Feed one point of the scripted curve into the real trend engine,
    using a fixed simulated timestamp per step (not real wall-clock time)
    so velocity/direction reflect the intended story regardless of how
    fast the steps are actually called."""
    if index < 0 or index >= len(DEMO_CURVE):
        return {"error": f"index must be 0..{len(DEMO_CURVE)-1}"}

    wetness = DEMO_CURVE[index]

    # Manually construct fake timestamps spaced SIMULATED_STEP_SECONDS apart,
    # anchored to "now" for step 0, instead of calling record_reading (which
    # would use real wall-clock time and reintroduce the bug).
    if _ZONE not in trend_module._history:
        from collections import deque
        trend_module._history[_ZONE] = deque(maxlen=trend_module.BUFFER_MAXLEN)

    if index == 0:
        base_time = time.time()
        trend_module._history[_ZONE].clear()
    else:
        # anchor off the first recorded timestamp if present, else now
        existing = trend_module._history[_ZONE]
        base_time = existing[0][0] if existing else time.time()

    fake_timestamp = base_time + index * SIMULATED_STEP_SECONDS
    trend_module._history[_ZONE].append((fake_timestamp, wetness))

    trend = get_trend(_ZONE)
    strategy = get_tyre_strategy(
        overall_wetness=wetness,
        trend_direction=trend["direction"],
        trend_velocity=trend["velocity"],
        confidence=trend["confidence"],
    )

    return {
        "simulated": True,
        "note": "Scripted demo input — showcases trend/strategy engine, not live vision",
        "step": index,
        "wetness": wetness,
        "trend": trend,
        "strategy": strategy,
    }


@router.get("/simulate/curve")
def simulate_curve():
    return {"simulated": True, "curve": DEMO_CURVE, "length": len(DEMO_CURVE)}
