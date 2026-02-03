from sqlalchemy.orm import Session
from app.models.lender import Lender, LenderProgram
from app.models.policy import PolicyCriteria
from app.models.match import MatchResult
from app.schemas.application import ApplicationCreate
from typing import List, Dict, Any

class MatchingEngine:
    def __init__(self, db: Session):
        self.db = db

    def evaluate_application(self, app_data: ApplicationCreate, loan_request_id: str) -> List[MatchResult]:
        lenders = self.db.query(Lender).filter(Lender.is_active == True).all()
        results = []

        for lender in lenders:
            programs = self.db.query(LenderProgram).filter(LenderProgram.lender_id == lender.id).all()
            for program in programs:
                result = self._evaluate_program(program, app_data, lender)
                
                # Save result to DB
                db_match = MatchResult(
                    loan_request_id=loan_request_id,
                    lender_id=lender.id,
                    program_id=program.id,
                    eligible=result["eligible"],
                    fit_score=result["fit_score"],
                    rejection_reasons=result["rejection_reasons"]
                )
                self.db.add(db_match)
                results.append(db_match)
        
        self.db.commit()
        return results

    def _evaluate_program(self, program: LenderProgram, app: ApplicationCreate, lender: Lender) -> Dict[str, Any]:
        reasons = []
        
        # 1. Basic Program Constraints
        if program.min_loan_amount and app.loan_request.amount < program.min_loan_amount:
            reasons.append(f"Loan amount too low (Min: {program.min_loan_amount})")
        if program.max_loan_amount and app.loan_request.amount > program.max_loan_amount:
            reasons.append(f"Loan amount too high (Max: {program.max_loan_amount})")

        # 2. Policy Criteria
        criteria_list = self.db.query(PolicyCriteria).filter(PolicyCriteria.program_id == program.id).all()
        
        score = 100 # Start with perfect score, deduct for "soft" failures if we had them, or use for ranking
        
        for criteria in criteria_list:
            if not self._check_rule(criteria, app):
                reasons.append(f"Failed {criteria.criteria_type} check: {criteria.operator} {criteria.value}")
                score -= 20 # Arbitrary penalty for failed rule if we wanted soft matching, but here we likely want hard fail

        if reasons:
            return {"eligible": False, "fit_score": 0, "rejection_reasons": reasons}
        
        # Calculate fit score (Simple logic for now)
        # Higher revenue = better score
        if app.business.annual_revenue:
            if app.business.annual_revenue > app.loan_request.amount * 2:
                score += 10
        
        return {"eligible": True, "fit_score": min(score, 100), "rejection_reasons": []}

    def _check_rule(self, criteria: PolicyCriteria, app: ApplicationCreate) -> bool:
        # Map criteria_type to value from application
        val = self._get_value_from_app(criteria.criteria_type, app)
        
        if val is None:
            return False # Fail if data missing

        op = criteria.operator
        target = criteria.value

        # Type Coercion for mismatched types (DB often returns strings for JSON fields if seeded as strings)
        try:
            if isinstance(val, (int, float)) and isinstance(target, str):
                try:
                    target = float(target)
                except ValueError:
                    pass
            elif isinstance(val, bool) and isinstance(target, str):
                if target.lower() == "true": target = True
                elif target.lower() == "false": target = False
            
            if op in ["in", "not in"] and isinstance(target, str):
                import json
                try:
                    target = json.loads(target)
                except:
                    pass
        except:
            pass # Proceed with original values if coercion fails

        try:
            if op == ">": return val > target
            if op == ">=": return val >= target
            if op == "<": return val < target
            if op == "<=": return val <= target
            if op == "==": return val == target
            if op == "!=": return val != target
            if op == "in": return val in target
            if op == "not in": return val not in target
        except:
            return False
            
        return False

    def _get_value_from_app(self, key: str, app: ApplicationCreate) -> Any:
        # Flattens the app structure for easy access
        from datetime import datetime, date
        current_year = datetime.now().year
        today = date.today()
        
        # Safe access helpers
        paynet = app.business_credit.paynet_score if app.business_credit else 0
        trade_lines = app.business_credit.trade_lines if app.business_credit else 0
        
        # Calculate years since bankruptcy
        years_since_bk = 999 # Default to high number if no bankruptcy
        if app.guarantor.bankruptcy_flag:
            if app.guarantor.bankruptcy_date:
                # Calculate difference in years
                delta = today - app.guarantor.bankruptcy_date
                years_since_bk = delta.days / 365.25
            else:
                years_since_bk = 0 # Assume recent if flagged but no date provided

        mapping = {
            "fico_score": app.guarantor.fico_score,
            "years_in_business": app.business.years_in_business,
            "annual_revenue": app.business.annual_revenue,
            "industry": app.business.industry,
            "state": app.business.state,
            "equipment_year": app.loan_request.equipment_year,
            "equipment_age": (current_year - app.loan_request.equipment_year) if app.loan_request.equipment_year else 0,
            "bankruptcy": app.guarantor.bankruptcy_flag,
            "years_since_bankruptcy": years_since_bk,
            "paynet_score": paynet,
            "trade_lines": trade_lines,
            "equipment_type": app.loan_request.equipment_type
        }
        return mapping.get(key)
