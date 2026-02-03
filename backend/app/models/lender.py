import uuid
from sqlalchemy import Column, String, Boolean, Numeric, ForeignKey
from app.core.database import Base

class Lender(Base):
    __tablename__ = "lender"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

class LenderProgram(Base):
    __tablename__ = "lender_program"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lender_id = Column(String, ForeignKey("lender.id"))
    name = Column(String, nullable=False)
    min_loan_amount = Column(Numeric)
    max_loan_amount = Column(Numeric)
