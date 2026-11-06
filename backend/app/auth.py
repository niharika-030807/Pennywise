"""Backward-compatible security and auth shim."""
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.api.deps import get_current_user

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
    "get_current_user"
]
