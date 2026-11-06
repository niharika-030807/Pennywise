from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.entities import User
from app.schemas.auth import (
    SendOTPRequest, VerifyOTPRequest, RegisterRequest,
    LoginRequest, ForgotPasswordResetRequest, TokenResponse, UserResponse
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """Dispatch 6-digit OTP for signup or password recovery."""
    return AuthService.send_otp(db, req.phone, req.purpose)

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify submitted OTP code."""
    AuthService.verify_otp(db, req.phone, req.code, req.purpose)
    return {"success": True, "message": "OTP verified successfully."}

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Complete user registration and issue JWT token."""
    user = AuthService.register_user(db, req.model_dump())
    login_res = AuthService.login(db, req.phone, req.password)
    return login_res

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate phone and password, return JWT token."""
    return AuthService.login(db, req.phone, req.password)

@router.post("/forgot-password/reset")
def reset_forgot_password(req: ForgotPasswordResetRequest, db: Session = Depends(get_db)):
    """Reset password securely with verified OTP."""
    AuthService.reset_password(db, req.model_dump())
    return {"success": True, "message": "Password updated successfully. Please log in with your new password."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get active authenticated user profile."""
    return current_user
