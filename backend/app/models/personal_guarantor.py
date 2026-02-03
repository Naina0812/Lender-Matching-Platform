import uuid
from sqlalchemy import Column, Integer, Boolean, ForeignKey, String, Date
from app.core.database import Base

class PersonalGuarantor(Base):
    __tablename__ = "personal_guarantor"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("business.id"))
    fico_score = Column(Integer, nullable=False)
    bankruptcy_flag = Column(Boolean, default=False)
    bankruptcy_date = Column(Date, nullable=True)
    collections_flag = Column(Boolean, default=False)
