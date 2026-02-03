from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class MatchResultResponse(BaseModel):
    lender_name: str
    program_name: str
    eligible: bool
    fit_score: int
    rejection_reasons: List[str] = []

    class Config:
        from_attributes = True
