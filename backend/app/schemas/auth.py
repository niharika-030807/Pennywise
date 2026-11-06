from typing import Optional
from pydantic import BaseModel, Field

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
