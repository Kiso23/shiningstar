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
    sender_id: Optional[str]
    content: str
    is_sensitive: bool
    requires_transfer: bool
    read_status: str
    is_typing: bool
    created_at: datetime
    read_at: Optional[datetime]
    updated_at: datetime

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


class AdminRespondRequest(BaseModel):
    chat_id: int
    admin_id: str
    message: str


class MarkMessageReadRequest(BaseModel):
    message_id: int


class TypingStatusRequest(BaseModel):
    chat_id: int
    is_typing: bool
