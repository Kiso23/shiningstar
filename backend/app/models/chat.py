from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class MessageType(str, enum.Enum):
    USER = "user"
    AI = "ai"
    ADMIN = "admin"


class ChatStatus(str, enum.Enum):
    OPEN = "open"
    TRANSFERRED = "transferred"
    CLOSED = "closed"


class ReadStatus(str, enum.Enum):
    UNREAD = "unread"
    READ = "read"


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    team_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, default=ChatStatus.OPEN)
    assigned_admin = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime, nullable=True)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, index=True)
    message_type = Column(String, default=MessageType.USER)  # user, ai, admin
    sender_id = Column(String, nullable=True)  # session_id for user, admin_id for admin
    content = Column(Text)
    is_sensitive = Column(Boolean, default=False)
    requires_transfer = Column(Boolean, default=False)
    read_status = Column(String, default=ReadStatus.UNREAD)  # unread, read
    is_typing = Column(Boolean, default=False)  # For real-time typing indicator
    created_at = Column(DateTime, server_default=func.now(), index=True)
    read_at = Column(DateTime, nullable=True)  # When message was read
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
