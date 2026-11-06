import random
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import User, OTPRecord
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import AppException, NotFoundException, UnauthorizedException, ValidationException
from app.services.sms_service import SMSService

class AuthService:
    """Authentication and User Account Security Service."""

    @staticmethod
    def generate_otp() -> str:
        """Generate secure 6-digit one-time password."""
        return f"{random.randint(100000, 999999)}"

    @classmethod
    def send_otp(cls, db: Session, phone: str, purpose: str) -> Dict[str, Any]:
        """Generate, store, and dispatch 6-digit OTP."""
        clean_phone = phone.strip()
        if not clean_phone or len(clean_phone) < 10:
            raise ValidationException("Please enter a valid 10-digit mobile number.")

        if purpose == "signup":
            existing = db.query(User).filter(User.phone == clean_phone).first()
            if existing:
                raise AppException("This phone number is already registered. Please log in.")
        elif purpose == "forgot_password":
            existing = db.query(User).filter(User.phone == clean_phone).first()
            if not existing:
                raise NotFoundException("No account found with this phone number.")

        code = cls.generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)

        # Invalidate previous OTPs for this phone/purpose
        db.query(OTPRecord).filter(
            OTPRecord.phone == clean_phone,
            OTPRecord.purpose == purpose
        ).delete()

        otp_rec = OTPRecord(
            phone=clean_phone,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
            verified=False
        )
        db.add(otp_rec)
        db.commit()

        # Send via SMS gateway or log to terminal
        sms_result = SMSService.send_verification_code(clean_phone, code, purpose)
        return sms_result

    @staticmethod
    def verify_otp(db: Session, phone: str, code: str, purpose: str) -> bool:
        """Verify entered 6-digit OTP."""
        clean_phone = phone.strip()
        clean_code = code.strip()

        rec = db.query(OTPRecord).filter(
            OTPRecord.phone == clean_phone,
            OTPRecord.purpose == purpose,
            OTPRecord.code == clean_code
        ).order_by(OTPRecord.id.desc()).first()

        if not rec:
            raise ValidationException("Invalid verification code. Please check and try again.")

        if datetime.utcnow() > rec.expires_at:
            raise ValidationException("This verification code has expired. Please request a new one.")

        rec.verified = True
        db.commit()
        return True

    @classmethod
    def register_user(cls, db: Session, data: Dict[str, Any]) -> User:
        """Verify details, ensure OTP was verified, create user with hashed password."""
        phone = data["phone"].strip()
        email = data["email"].strip().lower()
        password = data["password"]
        confirm_password = data["confirm_password"]
        otp_code = data["otp_code"].strip()

        if password != confirm_password:
            raise ValidationException("Passwords do not match.")

        if len(password) < 6:
            raise ValidationException("Password must be at least 6 characters.")

        # Check existing phone or email
        if db.query(User).filter(User.phone == phone).first():
            raise AppException("Phone number already registered. Please log in.")
        if db.query(User).filter(User.email == email).first():
            raise AppException("Email address already registered. Please log in.")

        # Verify OTP record
        rec = db.query(OTPRecord).filter(
            OTPRecord.phone == phone,
            OTPRecord.purpose == "signup",
            OTPRecord.code == otp_code
        ).order_by(OTPRecord.id.desc()).first()

        if not rec:
            raise ValidationException("Invalid verification code.")
        if datetime.utcnow() > rec.expires_at:
            raise ValidationException("Verification code has expired.")

        rec.verified = True

        # Create user
        new_user = User(
            first_name=data["first_name"].strip(),
            last_name=data["last_name"].strip(),
            phone=phone,
            email=email,
            password_hash=hash_password(password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def login(db: Session, phone: str, password: str) -> Dict[str, Any]:
        """Authenticate registered user credentials and issue JWT."""
        clean_phone = phone.strip()
        user = db.query(User).filter(User.phone == clean_phone).first()

        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid mobile number or password.")

        access_token = create_access_token(data={"sub": str(user.id), "phone": user.phone})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    def reset_password(db: Session, data: Dict[str, Any]) -> bool:
        """Reset password after OTP verification."""
        phone = data["phone"].strip()
        otp_code = data["otp_code"].strip()
        new_pwd = data["new_password"]
        confirm_pwd = data["confirm_password"]

        if new_pwd != confirm_pwd:
            raise ValidationException("Passwords do not match.")
        if len(new_pwd) < 6:
            raise ValidationException("Password must be at least 6 characters.")

        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            raise NotFoundException("User account not found.")

        # Verify OTP
        rec = db.query(OTPRecord).filter(
            OTPRecord.phone == phone,
            OTPRecord.purpose == "forgot_password",
            OTPRecord.code == otp_code
        ).order_by(OTPRecord.id.desc()).first()

        if not rec or datetime.utcnow() > rec.expires_at:
            raise ValidationException("Invalid or expired verification code.")

        rec.verified = True
        user.password_hash = hash_password(new_pwd)
        db.commit()
        return True
