from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ChatMessageCreate(BaseModel):
    content: str
    session_id: str
    team_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: int
    chat_id: int
    message_type: str
    content: str
    is_sensitive: bool
    requires_transfer: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    id: int
    session_id: str
    team_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    status: str
    assigned_admin: Optional[str]
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    chat: ChatResponse
    messages: List[ChatMessageResponse]


class TransferToAdminRequest(BaseModel):
    chat_id: int
    reason: str
    admin_id: Optional[str] = None
