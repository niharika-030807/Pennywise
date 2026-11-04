import random
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ConnectedBank, Transaction
from app.schemas import BankConnectDemoRequest, BankResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/bank", tags=["bank"])

SUPPORTED_BANKS = [
    {"id": "hdfc", "name": "HDFC Bank", "logo": "🏦", "ifsc_prefix": "HDFC000"},
    {"id": "sbi", "name": "State Bank of India", "logo": "🏛️", "ifsc_prefix": "SBIN000"},
    {"id": "icici", "name": "ICICI Bank", "logo": "💳", "ifsc_prefix": "ICIC000"},
    {"id": "axis", "name": "Axis Bank", "logo": "📈", "ifsc_prefix": "UTIB000"},
    {"id": "kotak", "name": "Kotak Mahindra Bank", "logo": "💼", "ifsc_prefix": "KKBK000"},
    {"id": "pnb", "name": "Punjab National Bank", "logo": "🏪", "ifsc_prefix": "PUNB000"}
]

@router.get("/supported")
def get_supported_banks():
    return SUPPORTED_BANKS

@router.get("/accounts", response_model=List[BankResponse])
def get_connected_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    banks = db.query(ConnectedBank).filter(ConnectedBank.user_id == current_user.id).all()
    return banks

@router.post("/connect-demo", response_model=BankResponse)
def connect_bank_demo(
    req: BankConnectDemoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Simulated RBI Account Aggregator consent & discovery
    bank_info = next((b for b in SUPPORTED_BANKS if b["name"].lower() == req.bank_name.lower()), None)
    if not bank_info:
        bank_name = req.bank_name
        ifsc_prefix = "INDI000"
    else:
        bank_name = bank_info["name"]
        ifsc_prefix = bank_info["ifsc_prefix"]

    # Generate masked account number and realistic balance
    rand_last_four = f"{random.randint(1000, 9999)}"
    masked_acc = f"XXXX-XXXX-{rand_last_four}"
    ifsc_code = f"{ifsc_prefix}{random.randint(1000, 9999)}"
    simulated_balance = float(random.randint(45000, 185000))

    new_bank = ConnectedBank(
        user_id=current_user.id,
        bank_name=bank_name,
        account_number_masked=masked_acc,
        ifsc=ifsc_code,
        account_type="Savings Account",
        balance=simulated_balance,
        status="connected",
        last_synced=datetime.utcnow()
    )
    db.add(new_bank)
    db.commit()
    db.refresh(new_bank)
    return new_bank

@router.post("/disconnect/{bank_id}")
def disconnect_bank(
    bank_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bank = db.query(ConnectedBank).filter(
        ConnectedBank.id == bank_id,
        ConnectedBank.user_id == current_user.id
    ).first()

    if not bank:
        raise HTTPException(status_code=404, detail="Bank connection not found.")

    db.delete(bank)
    db.commit()
    return {"success": True, "message": "Bank disconnected successfully."}

