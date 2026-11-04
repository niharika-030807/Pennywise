import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User, OTPRecord
from app.schemas import (
    SendOTPRequest, VerifyOTPRequest, RegisterRequest,
    LoginRequest, ForgotPasswordResetRequest, TokenResponse, UserResponse
)
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.services.sample_data import seed_sample_data_for_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

def generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return f"{random.randint(100000, 999999)}"

def send_sms_or_mock(phone: str, code: str, purpose: str) -> dict:
    """Send SMS via Twilio if configured, or return simulated test OTP with clear indication."""
    if settings.has_sms_provider:
        try:
            # Twilio integration if credentials exist
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            body_text = f"Your Pennywise verification code is {code}. Valid for 10 minutes."
            client.messages.create(
                body=body_text,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone
            )
            return {
                "success": True,
                "message": f"Verification code sent via SMS to {phone}",
                "is_test_mode": False
            }
        except Exception as e:
            # Fallback to test mode if SMS delivery fails
            return {
                "success": True,
                "message": f"SMS provider unavailable. Using Test Mode OTP.",
                "is_test_mode": True,
                "test_otp": code
            }
    else:
        # Development / Demo test OTP mode
        return {
            "success": True,
            "message": "Demo Test Mode: Use the 6-digit verification code below",
            "is_test_mode": True,
            "test_otp": code
        }

@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    if not phone or len(phone) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")

    # If purpose is signup, ensure phone isn't already registered
    if req.purpose == "signup":
        existing_user = db.query(User).filter(User.phone == phone).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="This phone number is already registered. Please log in.")
    elif req.purpose == "forgot_password":
        existing_user = db.query(User).filter(User.phone == phone).first()
        if not existing_user:
            raise HTTPException(status_code=404, detail="No account found with this phone number.")

    code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Invalidate previous OTPs for this phone/purpose
    db.query(OTPRecord).filter(
        OTPRecord.phone == phone,
        OTPRecord.purpose == req.purpose
    ).delete()

    otp_rec = OTPRecord(
        phone=phone,
        code=code,
        purpose=req.purpose,
        expires_at=expires_at,
        verified=False
    )
    db.add(otp_rec)
    db.commit()

    sms_res = send_sms_or_mock(phone, code, req.purpose)
    return sms_res

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    code = req.code.strip()

    otp_rec = db.query(OTPRecord).filter(
        OTPRecord.phone == phone,
        OTPRecord.purpose == req.purpose,
        OTPRecord.code == code
    ).order_by(OTPRecord.id.desc()).first()

    if not otp_rec:
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check and try again.")

    if datetime.utcnow() > otp_rec.expires_at:
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")

    otp_rec.verified = True
    db.commit()

    return {"success": True, "message": "Phone number verified successfully!"}

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    email = req.email.strip().lower()

    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    # Verify OTP was verified or verify now
    otp_rec = db.query(OTPRecord).filter(
        OTPRecord.phone == phone,
        OTPRecord.purpose == "signup",
        OTPRecord.code == req.otp_code.strip()
    ).first()

    if not otp_rec:
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    if datetime.utcnow() > otp_rec.expires_at:
        raise HTTPException(status_code=400, detail="Verification code has expired.")

    # Check phone or email uniqueness
    if db.query(User).filter(User.phone == phone).first():
        raise HTTPException(status_code=400, detail="Phone number is already registered.")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email is already registered.")

    # Create user
    pw_hash = hash_password(req.password)
    user = User(
        first_name=req.first_name.strip(),
        last_name=req.last_name.strip(),
        phone=phone,
        email=email,
        password_hash=pw_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Invalidate OTP record
    db.delete(otp_rec)
    db.commit()

    return {
        "success": True,
        "message": "Account created successfully! You can now log in.",
        "user_id": user.id
    }

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    user = db.query(User).filter(User.phone == phone).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid phone number or password.")

    token = create_access_token(data={"sub": str(user.id), "phone": user.phone})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/forgot-password/reset")
def forgot_password_reset(req: ForgotPasswordResetRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    otp_rec = db.query(OTPRecord).filter(
        OTPRecord.phone == phone,
        OTPRecord.purpose == "forgot_password",
        OTPRecord.code == req.otp_code.strip()
    ).first()

    if not otp_rec:
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    if datetime.utcnow() > otp_rec.expires_at:
        raise HTTPException(status_code=400, detail="Verification code has expired.")

    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.password_hash = hash_password(req.new_password)
    db.delete(otp_rec)
    db.commit()

    return {"success": True, "message": "Password updated successfully! Please log in."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

