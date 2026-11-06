from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    sender: str  # 'user' or 'assistant'
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True

class AssistantAnswer(BaseModel):
    response: str
    suggestions: List[str] = []
    detected_intent: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []
    context: Optional[dict] = None
