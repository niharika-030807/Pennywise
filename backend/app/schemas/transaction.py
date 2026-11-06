from typing import Optional
from pydantic import BaseModel

class TransactionBase(BaseModel):
    title: str
    amount: float
    type: str  # 'expense' or 'income'
    category: str
    date: str  # 'YYYY-MM-DD'
    payment_method: Optional[str] = "UPI"
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    payment_method: Optional[str] = None
    description: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
