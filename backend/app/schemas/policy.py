from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from uuid import UUID

class PolicyCriteriaBase(BaseModel):
    criteria_type: str  # e.g., "fico_score", "years_in_business"
    operator: str       # e.g., ">", ">=", "==", "in"
    value: Any

class PolicyCriteriaCreate(PolicyCriteriaBase):
    pass

class PolicyCriteriaResponse(PolicyCriteriaBase):
    id: str
    program_id: str

    class Config:
        from_attributes = True

class LenderProgramBase(BaseModel):
    name: str
    min_loan_amount: Optional[float] = None
    max_loan_amount: Optional[float] = None

class LenderProgramCreate(LenderProgramBase):
    policies: List[PolicyCriteriaCreate] = []

class LenderProgramResponse(LenderProgramBase):
    id: str
    lender_id: str
    policies: List[PolicyCriteriaResponse] = []

    class Config:
        from_attributes = True

class LenderBase(BaseModel):
    name: str
    is_active: bool = True

class LenderCreate(LenderBase):
    programs: List[LenderProgramCreate] = []

class LenderResponse(LenderBase):
    id: str
    programs: List[LenderProgramResponse] = []

    class Config:
        from_attributes = True
