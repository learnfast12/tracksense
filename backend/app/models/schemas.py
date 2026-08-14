from pydantic import BaseModel
from typing import Dict

class ZoneResult(BaseModel):
    wetness_score: float
    label: str

class AnalyzeFrameResponse(BaseModel):
    zones: Dict[str, ZoneResult]
    overall_wetness: float
    overall_label: str
