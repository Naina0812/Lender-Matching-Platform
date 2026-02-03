import uuid
from sqlalchemy import Column, Boolean, Integer, ForeignKey, DateTime, String, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class MatchResult(Base):
    __tablename__ = "match_result"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    loan_request_id = Column(String, ForeignKey("loan_request.id"))
    lender_id = Column(String, ForeignKey("lender.id"))
    program_id = Column(String, ForeignKey("lender_program.id"))
    eligible = Column(Boolean, nullable=False)
    fit_score = Column(Integer)
    rejection_reasons = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
