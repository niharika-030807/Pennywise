import sys
import json
import random
sys.stdout.reconfigure(encoding='utf-8')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_fintech_lifecycle():
    print("=== Testing Pennywise Fintech API Endpoints ===")

    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200
    print("[PASS] Health check passed:", res.json()["app"])

    # 2. Send OTP for signup
    test_phone = f"98{random.randint(10000000, 99999999)}"
    test_email = f"test.{test_phone}@example.com"
    res = client.post("/api/auth/send-otp", json={"phone": test_phone, "purpose": "signup"})
    assert res.status_code == 200, res.text
    
    # Retrieve the OTP record securely from the test DB session
    from app.core.database import SessionLocal
    from app.models.entities import OTPRecord
    with SessionLocal() as db_session:
        otp_rec = db_session.query(OTPRecord).filter(OTPRecord.phone == test_phone).order_by(OTPRecord.id.desc()).first()
        assert otp_rec is not None
        test_code = otp_rec.code
    print(f"[PASS] OTP dispatched securely: {test_code}")

    # 3. Verify OTP
    res = client.post("/api/auth/verify-otp", json={"phone": test_phone, "code": test_code, "purpose": "signup"})
    assert res.status_code == 200, res.text
    print("[PASS] OTP verified successfully")

    # 4. Register Account
    reg_payload = {
        "first_name": "Aarav",
        "last_name": "Sharma",
        "phone": test_phone,
        "email": test_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "otp_code": test_code
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200, res.text
    print("[PASS] User registered and sample realistic Indian transactions seeded")

    # 5. Login
    res = client.post("/api/auth/login", json={"phone": test_phone, "password": "Password123!"})
    assert res.status_code == 200, res.text
    token_data = res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Logged in and JWT token issued")

    # 6. Dashboard overview
    res = client.get("/api/dashboard/overview", headers=headers)
    assert res.status_code == 200, res.text
    dash = res.json()
    print(f"[PASS] Dashboard overview: Balance=Rs.{dash['total_balance']}, Income=Rs.{dash['monthly_income']}, Expense=Rs.{dash['monthly_expense']}")

    # 7. Add Transaction
    new_tx = {
        "title": "Starbucks Coffee & Snacks",
        "amount": 450.0,
        "type": "expense",
        "category": "Food and Dining",
        "date": "2024-11-04",
        "payment_method": "UPI",
        "description": "Afternoon coffee treat"
    }
    res = client.post("/api/transactions", json=new_tx, headers=headers)
    assert res.status_code == 200, res.text
    tx_id = res.json()["id"]
    print(f"[PASS] Transaction created with id={tx_id}")

    # 8. Get Transactions
    res = client.get("/api/transactions", headers=headers)
    assert res.status_code == 200, res.text
    tx_list = res.json()
    assert len(tx_list) > 0
    print(f"[PASS] Ledger retrieved: {len(tx_list)} entries")

    # 9. Monthly Wrap Summary
    res = client.get("/api/wrap/summary", headers=headers)
    assert res.status_code == 200, res.text
    wrap = res.json()
    print(f"[PASS] Monthly Wrap: {wrap['title']} | Persona: {wrap['personality']} | Savings Rate: {wrap['savings_rate']}%")

    # 10. Budget Planner
    res = client.get("/api/budgets/current", headers=headers)
    assert res.status_code == 200, res.text
    budget = res.json()
    print(f"[PASS] Budget: Limit=Rs.{budget['monthly_limit']}, Spent=Rs.{budget['total_spent']}, Remaining=Rs.{budget['remaining']}")

    # 11. Savings Goal & Deposit
    res = client.post("/api/goals", json={
        "title": "Goa Beach Villa Holiday",
        "target_amount": 50000.0,
        "target_date": "2025-04-15",
        "category": "Travel"
    }, headers=headers)
    assert res.status_code == 200, res.text
    goal_id = res.json()["id"]
    print(f"[PASS] Savings goal created id={goal_id}")

    res = client.post(f"/api/goals/{goal_id}/deposit", json={"amount": 10000.0}, headers=headers)
    assert res.status_code == 200, res.text
    print(f"[PASS] Deposited Rs.10,000 into goal. Progress={res.json()['progress_percentage']}%")

    # 12. Connect Bank Account Demo
    res = client.post("/api/bank/connect-demo", json={"bank_name": "State Bank of India", "phone": test_phone}, headers=headers)
    assert res.status_code == 200, res.text
    bank = res.json()
    print(f"[PASS] Bank linked: {bank['bank_name']} ({bank['account_number_masked']}) Balance=Rs.{bank['balance']}")

    # 13. Financial Assistant Chat
    res = client.post("/api/assistant/chat", json={"message": "How much did I spend this month?"}, headers=headers)
    assert res.status_code == 200, res.text
    chat_res = res.json()
    print("[PASS] Assistant Reply generated successfully")

    res = client.post("/api/assistant/chat", json={"message": "Can I afford a purchase of Rs.5,000?"}, headers=headers)
    assert res.status_code == 200, res.text
    print("[PASS] Affordability Query Reply generated successfully")

    print("\n>>> ALL 13 TEST SUITES PASSED FLAWLESSLY! <<<")

if __name__ == "__main__":
    test_full_fintech_lifecycle()
