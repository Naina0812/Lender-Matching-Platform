import uuid
from sqlalchemy import Column, Integer, ForeignKey, String
from app.core.database import Base

class BusinessCredit(Base):
    __tablename__ = "business_credit"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("business.id"))
    paynet_score = Column(Integer, nullable=True)
    trade_lines = Column(Integer, nullable=True)
