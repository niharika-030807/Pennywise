from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.entities import User
from app.schemas.bank import BankConnectDemoRequest, BankResponse
from app.services.bank_service import BankService

router = APIRouter(prefix="/bank", tags=["bank"])

@router.get("/supported")
def get_supported_banks():
    """List supported Indian financial institutions."""
    return BankService.get_supported_banks()

@router.get("/accounts", response_model=List[BankResponse])
def get_connected_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List linked bank accounts and available balances."""
    return BankService.get_connected_accounts(db, current_user.id)

@router.post("/connect-demo", response_model=BankResponse)
def connect_bank_demo(
    req: BankConnectDemoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simulate Account Aggregator consent flow to link Indian bank account."""
    return BankService.connect_demo_bank(
        db, current_user.id, req.bank_name, req.account_type or "Savings Account"
    )

@router.post("/disconnect/{bank_id}")
def disconnect_bank(
    bank_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke consent and disconnect bank account."""
    BankService.disconnect_bank(db, current_user.id, bank_id)
    return {"success": True, "message": "Bank disconnected successfully."}
