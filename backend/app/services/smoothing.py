"""
Simple per-key exponential moving average, in-memory.
Used to damp frame-to-frame camera/lighting noise (auto-exposure flicker,
gain hunting) before it propagates into fusion, trend, and strategy —
so the UI reflects real surface change, not sensor jitter.
"""

_ema_state: dict[str, float] = {}

def smooth(key: str, value: float, alpha: float = 0.35) -> float:
    """
    alpha closer to 1 = more responsive/less smoothing.
    alpha closer to 0 = smoother/slower to react.
    0.35 tracks a real wetness change within ~3-4 frames (~9-12s)
    while killing single-frame noise spikes.
    """
    prev = _ema_state.get(key)
    if prev is None:
        smoothed = value
    else:
        smoothed = alpha * value + (1 - alpha) * prev
    _ema_state[key] = smoothed
    return round(smoothed, 1)
