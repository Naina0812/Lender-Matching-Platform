from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.policy import LenderCreate, LenderResponse, LenderProgramCreate, PolicyCriteriaCreate
from app.models.lender import Lender, LenderProgram
from app.models.policy import PolicyCriteria
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=LenderResponse)
def create_lender(lender_data: LenderCreate, db: Session = Depends(get_db)):
    lender = Lender(name=lender_data.name, is_active=lender_data.is_active)
    db.add(lender)
    db.commit()
    db.refresh(lender)
    return lender

@router.post("/{lender_id}/programs")
def create_program(lender_id: str, program_data: LenderProgramCreate, db: Session = Depends(get_db)):
    program = LenderProgram(
        lender_id=lender_id,
        name=program_data.name,
        min_loan_amount=program_data.min_loan_amount,
        max_loan_amount=program_data.max_loan_amount
    )
    db.add(program)
    db.commit()
    db.refresh(program)

    for policy in program_data.policies:
        db_policy = PolicyCriteria(
            program_id=program.id,
            criteria_type=policy.criteria_type,
            operator=policy.operator,
            value=policy.value
        )
        db.add(db_policy)
    
    db.commit()
    return {"message": "Program created", "program_id": program.id}

@router.get("/", response_model=List[LenderResponse])
def list_lenders(db: Session = Depends(get_db)):
    return db.query(Lender).all()
