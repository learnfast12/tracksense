def fuse_signals(vision_score: float, thermal_score: float) -> dict:
    """
    Cross-checks two independent wetness signals.
    Close agreement -> high confidence, tight estimate.
    Disagreement -> lower confidence, flagged for review.
    """
    diff = abs(vision_score - thermal_score)
    fused_score = round((vision_score + thermal_score) / 2, 1)

    if diff <= 10:
        confidence = round(max(60, 100 - diff * 2), 1)
        flagged = False
    elif diff <= 25:
        confidence = round(max(30, 70 - diff), 1)
        flagged = False
    else:
        confidence = round(max(10, 50 - diff * 0.5), 1)
        flagged = True

    return {
        "fused_wetness": fused_score,
        "confidence": confidence,
        "signals_agree": diff <= 10,
        "flagged_for_review": flagged,
        "signal_diff": round(diff, 1),
    }
