import re
import requests
from typing import Dict, Any
from app.core.config import settings

class SMSService:
    @staticmethod
    def sanitize_indian_phone(phone: str) -> str:
        """Strip non-digits and normalize to 10-digit format for Indian carrier dispatch."""
        clean = re.sub(r'\D', '', phone)
        if clean.startswith('91') and len(clean) > 10:
            clean = clean[2:]
        return clean[-10:]

    @classmethod
    def send_verification_code(cls, phone: str, code: str, purpose: str = "verification") -> Dict[str, Any]:
        """Dispatches OTP via Fast2SMS (Indian carrier) or Twilio, or logs to terminal console."""
        clean_phone = cls.sanitize_indian_phone(phone)

        # 1. Fast2SMS Integration (Indian Gateway - standard for +91)
        if settings.FAST2SMS_API_KEY:
            try:
                url = "https://www.fast2sms.com/dev/bulkV2"
                querystring = {
                    "authorization": settings.FAST2SMS_API_KEY,
                    "variables_values": code,
                    "route": "otp",
                    "numbers": clean_phone
                }
                headers = {'cache-control': "no-cache"}
                resp = requests.get(url, headers=headers, params=querystring, timeout=5)
                data = resp.json()
                if data.get("return"):
                    return {
                        "success": True,
                        "message": f"Verification code sent via SMS to +91 {clean_phone}.",
                        "provider": "fast2sms"
                    }
            except Exception as e:
                print(f"[FAST2SMS DISPATCH ERROR] {e}")

        # 2. Twilio Integration
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
            try:
                from twilio.rest import Client
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                target = f"+91{clean_phone}"
                client.messages.create(
                    body=f"Your Pennywise verification code is {code}. Valid for 10 minutes.",
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=target
                )
                return {
                    "success": True,
                    "message": f"Verification code sent via SMS to {target}.",
                    "provider": "twilio"
                }
            except Exception as e:
                print(f"[TWILIO DISPATCH ERROR] {e}")

        # 3. Development / Server Console Log (When no paid SMS gateway API key is configured)
        print("\n" + "=" * 65)
        print(f"  [PENNYWISE SMS GATEWAY - CONSOLE DISPATCH]")
        print(f"  Destination Mobile : +91 {clean_phone}")
        print(f"  Verification Code  : {code}")
        print(f"  Purpose            : {purpose.replace('_', ' ').title()}")
        print(f"  Status             : Generated securely on server")
        print("=" * 65 + "\n", flush=True)

        return {
            "success": True,
            "message": f"Verification code dispatched to +91 {clean_phone}.",
            "provider": "console"
        }
