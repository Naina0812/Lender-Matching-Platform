import sys
import os
from datetime import date
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add parent dir to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.models.lender import Lender, LenderProgram
from app.models.policy import PolicyCriteria
from app.models.match import MatchResult

def setup_database_and_seed():
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    print("Checking database schema...")
    # Self-healing: Ensure bankruptcy_date column exists
    try:
        with engine.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            conn.execute(text("ALTER TABLE personal_guarantor ADD COLUMN IF NOT EXISTS bankruptcy_date DATE"))
        print("Schema verified: bankruptcy_date column exists.")
    except Exception as e:
        print(f"Schema check warning: {e}")

    print("Clearing existing lender data...")
    # Must clear match results first because they reference programs/lenders
    db.query(MatchResult).delete()
    db.query(PolicyCriteria).delete()
    db.query(LenderProgram).delete()
    db.query(Lender).delete()
    db.commit()

    print("Seeding Lenders from provided images...")

    # 1. Falcon Equipment Finance
    # Rules: BK > 15 years, FICO > 680 (from "Credit Guidelines"), Trucking Age < 10
    falcon = Lender(name="Falcon Equipment Finance", is_active=True)
    db.add(falcon)
    db.commit()

    falcon_prog = LenderProgram(
        lender_id=falcon.id,
        name="Standard Program",
        min_loan_amount=15000,
        max_loan_amount=150000 # Tier 2
    )
    db.add(falcon_prog)
    db.commit()

    # Falcon Policies
    policies = [
        # "Bankruptcies dismissed or discharged 15+ years ago"
        # Logic: If no BK, years=999. If BK, years must be >= 15.
        PolicyCriteria(program_id=falcon_prog.id, criteria_type="years_since_bankruptcy", operator=">=", value=15),
        
        # "Minimum FICO Requirement 680+"
        PolicyCriteria(program_id=falcon_prog.id, criteria_type="fico_score", operator=">=", value=680),
        
        # "Class 8 trucks... 10 years and newer" - Simplified to all equipment for this demo
        PolicyCriteria(program_id=falcon_prog.id, criteria_type="equipment_age", operator="<=", value=10)
    ]
    for p in policies: db.add(p)

    # 2. Advantage+
    # Rules: No BK, FICO > 680, Max Loan 75k
    advantage = Lender(name="Advantage+", is_active=True)
    db.add(advantage)
    db.commit()

    adv_prog = LenderProgram(
        lender_id=advantage.id,
        name="Broker Program",
        min_loan_amount=10000,
        max_loan_amount=75000
    )
    db.add(adv_prog)
    db.commit()

    # Advantage+ Policies
    policies = [
        # "Do you finance bankruptcies? No"
        PolicyCriteria(program_id=adv_prog.id, criteria_type="bankruptcy", operator="==", value=False),
        
        # "Minimum FICO score? 680"
        PolicyCriteria(program_id=adv_prog.id, criteria_type="fico_score", operator=">=", value=680),
        
        # "Minimum industry experience? 3 years"
        PolicyCriteria(program_id=adv_prog.id, criteria_type="years_in_business", operator=">=", value=3)
    ]
    for p in policies: db.add(p)

    # 3. Apex Commercial Capital
    # Rules: "No BK in last 7 years" (Inferred from Credit Box image often associated with similar tiers, 
    # but specifically using the 'Credit Box' image rules here as a proxy for a generic Tier B/C lender if Apex rules aren't fully visible for BK)
    # Actually, let's use the "Credit Box" image as a separate lender "Generic Tier B Lender"
    credit_box = Lender(name="Credit Box Lender", is_active=True)
    db.add(credit_box)
    db.commit()

    cb_prog = LenderProgram(
        lender_id=credit_box.id,
        name="Tier 2 Program",
        min_loan_amount=10000,
        max_loan_amount=100000
    )
    db.add(cb_prog)
    db.commit()

    # Credit Box Policies
    policies = [
        # "No BK in last 7 years"
        PolicyCriteria(program_id=cb_prog.id, criteria_type="years_since_bankruptcy", operator=">=", value=7),
        
        # "FICO 710" (Tier 2)
        PolicyCriteria(program_id=cb_prog.id, criteria_type="fico_score", operator=">=", value=710),
        
        # "TIB 3" (Time in Business)
        PolicyCriteria(program_id=cb_prog.id, criteria_type="years_in_business", operator=">=", value=3)
    ]
    for p in policies: db.add(p)

    db.commit()
    print("Seeding complete. Lenders added: Falcon, Advantage+, Credit Box Lender.")
    db.close()

if __name__ == "__main__":
    setup_database_and_seed()
