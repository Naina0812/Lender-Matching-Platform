import requests
from datetime import date, timedelta

API_URL = "http://localhost:8000"

def test_bankruptcy_logic():
    print("Testing Bankruptcy Logic against seeded lenders...")
    
    # Scenario 1: Recent Bankruptcy (2 years ago)
    # Expected: 
    # - Falcon (Requires 15y): REJECT
    # - Advantage+ (No BK): REJECT
    # - Credit Box (Requires 7y): REJECT
    
    bk_date_recent = (date.today() - timedelta(days=2*365)).isoformat()
    
    app_recent_bk = {
        "business": {
            "name": "Recent BK Corp",
            "industry": "Construction",
            "state": "TX",
            "years_in_business": 5,
            "annual_revenue": 500000
        },
        "guarantor": {
            "fico_score": 750,
            "bankruptcy_flag": True,
            "bankruptcy_date": bk_date_recent,
            "collections_flag": False
        },
        "loan_request": {
            "amount": 50000,
            "term_months": 36,
            "equipment_type": "Truck",
            "equipment_year": 2020
        }
    }
    
    # Scenario 2: Old Bankruptcy (10 years ago)
    # Expected:
    # - Falcon (Requires 15y): REJECT
    # - Advantage+ (No BK): REJECT
    # - Credit Box (Requires 7y): ACCEPT
    
    bk_date_old = (date.today() - timedelta(days=10*365)).isoformat()
    
    app_old_bk = {
        "business": {
            "name": "Old BK Corp",
            "industry": "Construction",
            "state": "TX",
            "years_in_business": 5,
            "annual_revenue": 500000
        },
        "guarantor": {
            "fico_score": 750,
            "bankruptcy_flag": True,
            "bankruptcy_date": bk_date_old,
            "collections_flag": False
        },
        "loan_request": {
            "amount": 50000,
            "term_months": 36,
            "equipment_type": "Truck",
            "equipment_year": 2020
        }
    }

    # Scenario 3: Ancient Bankruptcy (16 years ago)
    # Expected:
    # - Falcon (Requires 15y): ACCEPT
    # - Advantage+ (No BK): REJECT (Strict No)
    # - Credit Box (Requires 7y): ACCEPT
    
    bk_date_ancient = (date.today() - timedelta(days=16*365)).isoformat()
    
    app_ancient_bk = {
        "business": {
            "name": "Ancient BK Corp",
            "industry": "Construction",
            "state": "TX",
            "years_in_business": 5,
            "annual_revenue": 500000
        },
        "guarantor": {
            "fico_score": 750,
            "bankruptcy_flag": True,
            "bankruptcy_date": bk_date_ancient,
            "collections_flag": False
        },
        "loan_request": {
            "amount": 50000,
            "term_months": 36,
            "equipment_type": "Truck",
            "equipment_year": 2020
        }
    }

    # Run Tests
    scenarios = [
        ("Recent BK (2y)", app_recent_bk),
        ("Old BK (10y)", app_old_bk),
        ("Ancient BK (16y)", app_ancient_bk)
    ]

    for name, data in scenarios:
        print(f"\n--- Testing: {name} ---")
        try:
            response = requests.post(f"{API_URL}/api/applications/submit", json=data)
            if response.status_code == 200:
                results = response.json()
                for r in results:
                    status = "ELIGIBLE" if r['eligible'] else "REJECTED"
                    print(f"  {r['lender_name']}: {status}")
                    if not r['eligible']:
                        print(f"    Reasons: {r['rejection_reasons']}")
            else:
                print(f"Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Request failed: {e} (Is the server running?)")

if __name__ == "__main__":
    test_bankruptcy_logic()
