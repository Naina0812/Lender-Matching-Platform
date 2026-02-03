import uuid
from sqlalchemy import Column, String, ForeignKey, JSON
from app.core.database import Base

class PolicyCriteria(Base):
    __tablename__ = "policy_criteria"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    program_id = Column(String, ForeignKey("lender_program.id"))
    criteria_type = Column(String, nullable=False)
    operator = Column(String, nullable=False)
    value = Column(JSON, nullable=False)
