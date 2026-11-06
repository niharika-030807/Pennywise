import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import ConnectedBank
from app.core.exceptions import NotFoundException

SUPPORTED_BANKS = [
    {"id": "hdfc", "name": "HDFC Bank", "logo": "🏦", "ifsc_prefix": "HDFC000"},
    {"id": "sbi", "name": "State Bank of India", "logo": "🏛️", "ifsc_prefix": "SBIN000"},
    {"id": "icici", "name": "ICICI Bank", "logo": "💳", "ifsc_prefix": "ICIC000"},
    {"id": "axis", "name": "Axis Bank", "logo": "📈", "ifsc_prefix": "UTIB000"},
    {"id": "kotak", "name": "Kotak Mahindra Bank", "logo": "💼", "ifsc_prefix": "KKBK000"},
    {"id": "pnb", "name": "Punjab National Bank", "logo": "🏪", "ifsc_prefix": "PUNB000"}
]

class BankService:
    @staticmethod
    def get_supported_banks() -> List[Dict[str, Any]]:
        return SUPPORTED_BANKS

    @staticmethod
    def get_connected_accounts(db: Session, user_id: int) -> List[ConnectedBank]:
        return db.query(ConnectedBank).filter(ConnectedBank.user_id == user_id).all()

    @staticmethod
    def connect_demo_bank(db: Session, user_id: int, bank_name: str, account_type: str = "Savings Account") -> ConnectedBank:
        bank_info = next((b for b in SUPPORTED_BANKS if b["name"].lower() == bank_name.lower()), None)
        if not bank_info:
            clean_name = bank_name
            ifsc_prefix = "INDI000"
        else:
            clean_name = bank_info["name"]
            ifsc_prefix = bank_info["ifsc_prefix"]

        rand_last_four = f"{random.randint(1000, 9999)}"
        masked_acc = f"XXXX-XXXX-{rand_last_four}"
        ifsc_code = f"{ifsc_prefix}{random.randint(1000, 9999)}"
        simulated_balance = float(random.randint(45000, 185000))

        new_bank = ConnectedBank(
            user_id=user_id,
            bank_name=clean_name,
            account_number_masked=masked_acc,
            ifsc=ifsc_code,
            account_type=account_type or "Savings Account",
            balance=simulated_balance,
            status="connected",
            last_synced=datetime.utcnow()
        )
        db.add(new_bank)
        db.commit()
        db.refresh(new_bank)
        return new_bank

    @staticmethod
    def disconnect_bank(db: Session, user_id: int, bank_id: int) -> bool:
        bank = db.query(ConnectedBank).filter(
            ConnectedBank.id == bank_id,
            ConnectedBank.user_id == user_id
        ).first()

        if not bank:
            raise NotFoundException("Bank connection not found.")

        db.delete(bank)
        db.commit()
        return True
