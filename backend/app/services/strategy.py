def _tyre_for_wetness(wetness: float) -> str:
    if wetness < 20:
        return "Slicks"
    elif wetness < 40:
        return "Slicks (risky)"
    elif wetness < 70:
        return "Intermediates"
    else:
        return "Full Wets"


def get_tyre_strategy(overall_wetness: float, trend_direction: str, trend_velocity: float, confidence: float) -> dict:
    """
    Tyre pick and message are derived from the SAME branch, never independently,
    so they can never contradict each other on the dashboard.
    """
    WETTING_ESCALATION_THRESHOLD = 3.0  # pts/min — fast enough to jump the tyre call early

    if trend_direction == "wetting" and abs(trend_velocity) >= WETTING_ESCALATION_THRESHOLD:
        # Conditions worsening fast enough that we escalate ahead of the raw wetness score
        base_tyre = _tyre_for_wetness(overall_wetness)
        tyre = "Full Wets" if base_tyre != "Full Wets" else base_tyre
        message = f"Conditions worsening fast ({abs(trend_velocity):.1f} pts/min) — switch to {tyre} now"

    elif trend_direction == "wetting":
        tyre = _tyre_for_wetness(overall_wetness)
        message = f"Wetting — hold {tyre}, monitor closely"

    elif trend_direction == "drying" and abs(trend_velocity) > 0:
        tyre = _tyre_for_wetness(overall_wetness)
        laps_to_crossover = max(1, round(overall_wetness / max(abs(trend_velocity), 0.1) / 2))
        message = f"Drying — {tyre} for now, slick window in ~{laps_to_crossover} laps"

    else:
        tyre = _tyre_for_wetness(overall_wetness)
        message = f"Stable — hold {tyre}"

    return {
        "recommended_tyre": tyre,
        "message": message,
        "confidence": confidence,
    }
