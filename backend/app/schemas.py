from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Auth schemas
class SendOTPRequest(BaseModel):
    phone: str
    purpose: str = "signup"  # 'signup' or 'forgot_password'

class VerifyOTPRequest(BaseModel):
    phone: str
    code: str
    purpose: str = "signup"

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str
    password: str
    confirm_password: str
    otp_code: str

class LoginRequest(BaseModel):
    phone: str
    password: str

class ForgotPasswordResetRequest(BaseModel):
    phone: str
    otp_code: str
    new_password: str
    confirm_password: str

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: str
    email: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Transaction schemas
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

# Budget schemas
class BudgetCreate(BaseModel):
    month: int
    year: int
    monthly_limit: float
    category_budgets: Dict[str, float] = {}

class BudgetResponse(BaseModel):
    id: int
    month: int
    year: int
    monthly_limit: float
    category_budgets: Dict[str, float]
    total_spent: float
    remaining: float
    progress_percentage: float
    alerts: List[str]

# Savings Goal schemas
class GoalCreate(BaseModel):
    title: str
    target_amount: float
    target_date: str
    category: Optional[str] = "General"

class GoalDeposit(BaseModel):
    amount: float

class GoalResponse(BaseModel):
    id: int
    title: str
    target_amount: float
    current_amount: float
    target_date: str
    category: str
    remaining_amount: float
    progress_percentage: float
    recommended_monthly_savings: float

    class Config:
        from_attributes = True

# Bank schemas
class BankConnectDemoRequest(BaseModel):
    bank_name: str
    phone: str

class BankResponse(BaseModel):
    id: int
    bank_name: str
    account_number_masked: str
    ifsc: str
    account_type: str
    balance: float
    status: str

    class Config:
        from_attributes = True

# Assistant schemas
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
    insights: Dict[str, Any] = {}
