"""Backward-compatible models shim."""
from app.models.entities import (
    User,
    OTPRecord,
    Transaction,
    Budget,
    SavingsGoal,
    ConnectedBank,
    ChatMessage
)

__all__ = [
    "User",
    "OTPRecord",
    "Transaction",
    "Budget",
    "SavingsGoal",
    "ConnectedBank",
    "ChatMessage"
]
