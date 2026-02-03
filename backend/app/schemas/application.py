from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID

class PersonalGuarantorBase(BaseModel):
    fico_score: int = Field(..., ge=300, le=850)
    bankruptcy_flag: bool = False
    bankruptcy_date: Optional[date] = None
    collections_flag: bool = False

class BusinessCreditBase(BaseModel):
    paynet_score: Optional[int] = None
    trade_lines: Optional[int] = None

class LoanRequestBase(BaseModel):
    amount: float = Field(..., gt=0)
    term_months: int = Field(..., gt=0)
    equipment_type: Optional[str] = None
    equipment_year: Optional[int] = None

class BusinessBase(BaseModel):
    name: str
    industry: str
    state: str = Field(..., min_length=2, max_length=2)
    years_in_business: int = Field(..., ge=0)
    annual_revenue: Optional[float] = None

class ApplicationCreate(BaseModel):
    business: BusinessBase
    guarantor: PersonalGuarantorBase
    business_credit: Optional[BusinessCreditBase] = None
    loan_request: LoanRequestBase

from app.schemas.match import MatchResultResponse

class ApplicationResponse(BaseModel):
    id: str
    status: str = "processing"
    created_at: datetime
    business: BusinessBase
    guarantor: Optional[PersonalGuarantorBase] = None
    business_credit: Optional[BusinessCreditBase] = None
    loan_request: Optional[LoanRequestBase] = None
    matches: List[MatchResultResponse] = []
    
    class Config:
        from_attributes = True
