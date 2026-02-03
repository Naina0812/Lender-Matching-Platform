from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.models.business import Business
from app.models.personal_guarantor import PersonalGuarantor
from app.models.business_credit import BusinessCredit
from app.models.loan import LoanRequest
from app.models.lender import Lender, LenderProgram
from app.services.matching_engine import MatchingEngine
from app.schemas.match import MatchResultResponse
from typing import List

from app.models.match import MatchResult

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _fetch_matches_for_loan_request(db: Session, loan_request_id: str) -> List[MatchResultResponse]:
    db_matches = db.query(MatchResult).filter(MatchResult.loan_request_id == loan_request_id).all()
    matches = []
    for r in db_matches:
        program = db.query(LenderProgram).filter(LenderProgram.id == r.program_id).first()
        lender = db.query(Lender).filter(Lender.id == r.lender_id).first()
        matches.append(MatchResultResponse(
            lender_name=lender.name if lender else "Unknown",
            program_name=program.name if program else "Unknown",
            eligible=r.eligible,
            fit_score=r.fit_score,
            rejection_reasons=r.rejection_reasons
        ))
    return matches

@router.post("/submit", response_model=List[MatchResultResponse])
def submit_application(app_data: ApplicationCreate, db: Session = Depends(get_db)):
    # 1. Save Data
    business = Business(**app_data.business.dict())
    db.add(business)
    db.commit()
    db.refresh(business)

    guarantor = PersonalGuarantor(**app_data.guarantor.dict(), business_id=business.id)
    db.add(guarantor)

    if app_data.business_credit:
        credit = BusinessCredit(**app_data.business_credit.dict(), business_id=business.id)
        db.add(credit)

    loan_req = LoanRequest(**app_data.loan_request.dict(), business_id=business.id)
    db.add(loan_req)
    db.commit()
    db.refresh(loan_req)

    # 2. Run Matching Engine
    engine = MatchingEngine(db)
    results = engine.evaluate_application(app_data, loan_req.id)
    
    # 3. Format Response
    response = []
    for r in results:
        lender_name = r.program_id # In real app, would join to get name. Simplification for now.
        # Let's do a quick fetch for names to be nice
        program = db.query(LenderProgram).filter(LenderProgram.id == r.program_id).first()
        lender = db.query(Lender).filter(Lender.id == r.lender_id).first()
        
        response.append(MatchResultResponse(
            lender_name=lender.name if lender else "Unknown",
            program_name=program.name if program else "Unknown",
            eligible=r.eligible,
            fit_score=r.fit_score,
            rejection_reasons=r.rejection_reasons
        ))
    
    return response

@router.get("/", response_model=List[ApplicationResponse])
def get_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    businesses = db.query(Business).order_by(Business.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for b in businesses:
        guarantor = db.query(PersonalGuarantor).filter(PersonalGuarantor.business_id == b.id).first()
        credit = db.query(BusinessCredit).filter(BusinessCredit.business_id == b.id).first()
        loan_req = db.query(LoanRequest).filter(LoanRequest.business_id == b.id).first()
        
        matches = []
        if loan_req:
            matches = _fetch_matches_for_loan_request(db, loan_req.id)
            
        results.append({
            "id": b.id,
            "created_at": b.created_at,
            "business": b,
            "guarantor": guarantor,
            "business_credit": credit,
            "loan_request": loan_req,
            "matches": matches
        })
    return results

@router.get("/{id}", response_model=ApplicationResponse)
def get_application(id: str, db: Session = Depends(get_db)):
    # Fetch business
    business = db.query(Business).filter(Business.id == id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # We need to fetch related data manually if relationships aren't set up
    guarantor = db.query(PersonalGuarantor).filter(PersonalGuarantor.business_id == id).first()
    credit = db.query(BusinessCredit).filter(BusinessCredit.business_id == id).first()
    loan_req = db.query(LoanRequest).filter(LoanRequest.business_id == id).first()
    
    matches = []
    if loan_req:
        matches = _fetch_matches_for_loan_request(db, loan_req.id)
    
    return {
        "id": business.id,
        "created_at": business.created_at,
        "business": business,
        "guarantor": guarantor,
        "business_credit": credit,
        "loan_request": loan_req,
        "matches": matches
    }

@router.get("/{id}/matches", response_model=List[MatchResultResponse])
def get_application_matches(id: str, db: Session = Depends(get_db)):
    # 1. Get Loan Request ID for this business application
    loan_req = db.query(LoanRequest).filter(LoanRequest.business_id == id).first()
    if not loan_req:
        return []
        
    # 2. Get Matches
    results = db.query(MatchResult).filter(MatchResult.loan_request_id == loan_req.id).all()
    
    # 3. Format Response
    response = []
    for r in results:
        program = db.query(LenderProgram).filter(LenderProgram.id == r.program_id).first()
        lender = db.query(Lender).filter(Lender.id == r.lender_id).first()
        
        response.append(MatchResultResponse(
            lender_name=lender.name if lender else "Unknown",
            program_name=program.name if program else "Unknown",
            eligible=r.eligible,
            fit_score=r.fit_score,
            rejection_reasons=r.rejection_reasons
        ))
    return response

@router.delete("/{id}", status_code=204)
def delete_application(id: str, db: Session = Depends(get_db)):
    # 1. Check if business exists
    business = db.query(Business).filter(Business.id == id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # 2. Find related LoanRequest to delete matches first
    loan_req = db.query(LoanRequest).filter(LoanRequest.business_id == id).first()
    if loan_req:
        # Delete matches
        db.query(MatchResult).filter(MatchResult.loan_request_id == loan_req.id).delete()
        # Delete loan request
        db.query(LoanRequest).filter(LoanRequest.id == loan_req.id).delete()
    
    # 3. Delete other related entities
    db.query(PersonalGuarantor).filter(PersonalGuarantor.business_id == id).delete()
    db.query(BusinessCredit).filter(BusinessCredit.business_id == id).delete()
    
    # 4. Delete Business
    db.delete(business)
    db.commit()
    return None
