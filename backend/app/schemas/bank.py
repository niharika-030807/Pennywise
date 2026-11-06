from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ConnectBankRequest(BaseModel):
    bank_name: str
    phone_number: Optional[str] = None
    account_type: Optional[str] = "Savings"
    seed_demo_transactions: Optional[bool] = False

BankConnectDemoRequest = ConnectBankRequest

class ConnectedBankResponse(BaseModel):
    id: int
    user_id: int
    bank_name: str
    account_number_masked: str
    ifsc: str
    account_type: str
    balance: float
    status: str
    last_synced: datetime

    class Config:
        from_attributes = True

BankResponse = ConnectedBankResponse
