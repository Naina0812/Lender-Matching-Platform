import uuid
from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class LoanRequest(Base):
    __tablename__ = "loan_request"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("business.id"))
    amount = Column(Numeric, nullable=False)
    term_months = Column(Integer, nullable=False)
    equipment_type = Column(String, nullable=True)
    equipment_year = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
