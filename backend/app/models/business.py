import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Business(Base):
    __tablename__ = "business"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    state = Column(String, nullable=False)
    years_in_business = Column(Integer, nullable=False)
    annual_revenue = Column(Numeric, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
