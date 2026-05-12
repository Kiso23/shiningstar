from sqlalchemy.orm import Session
from app.models.chat import Chat, ChatMessage, ChatStatus, MessageType
from app.schemas.chat import ChatMessageCreate
from datetime import datetime
import re


class ChatService:
    """Service for handling chat messages and AI/Admin routing"""

    # Common registration questions and answers
    COMMON_QUESTIONS = {
        "registration fee": "The registration fee is ₹801 per team, payable via UPI.",
        "how to register": "Follow these steps: 1) Fill team details 2) Add players 3) Pay ₹801 via UPI 4) Get admin approval",
        "deadline": "Registration deadline is June 30, 2026.",
        "refund policy": "Cancel at least 4 days before tournament start for full refund. Cancellations within 4 days are not eligible.",
        "team size": "Minimum 11 players, maximum 18 players per team.",
        "payment": "Payment must be made via UPI to the provided account.",
        "documents": "Please bring Aadhaar or PAN card for verification.",
        "tournament date": "Tournament starts on July 8, 2026.",
        "venue": "Tournament venue is Rongbong Ronghang Playground.",
        "max teams": "Maximum 32 teams will be accepted.",
    }

    # Keywords that indicate sensitive/advanced questions
    SENSITIVE_KEYWORDS = [
        "refund", "payment issue", "problem", "complaint", "error", "bug",
        "special request", "exception", "discount", "urgent", "help",
        "not working", "failed", "issue", "dispute", "cancel"
    ]

    @staticmethod
    def create_chat(session_id: str, db: Session) -> Chat:
        """Create a new chat session"""
        chat = Chat(session_id=session_id)
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat

    @staticmethod
    def get_or_create_chat(session_id: str, db: Session) -> Chat:
        """Get existing chat or create new one"""
        chat = db.query(Chat).filter(Chat.session_id == session_id).first()
        if not chat:
            chat = ChatService.create_chat(session_id, db)
        return chat

    @staticmethod
    def is_sensitive_question(message: str) -> bool:
        """Check if message contains sensitive keywords"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in ChatService.SENSITIVE_KEYWORDS)

    @staticmethod
    def get_ai_response(message: str) -> tuple[str, bool]:
        """
        Generate AI response for common questions
        Returns: (response, requires_transfer)
        """
        message_lower = message.lower()

        # Check for common questions
        for keyword, answer in ChatService.COMMON_QUESTIONS.items():
            if keyword in message_lower:
                return answer, False

        # Check if it's a sensitive question
        if ChatService.is_sensitive_question(message):
            return (
                "Thank you for your question. This requires attention from our admin team. "
                "I'm transferring you to a live agent who will assist you shortly.",
                True
            )

        # Default response for unknown questions
        return (
            "I'm not sure about that. Let me connect you with our admin team who can help better. "
            "Please wait while I transfer your chat.",
            True
        )

    @staticmethod
    def save_message(
        chat_id: int,
        message_type: str,
        content: str,
        is_sensitive: bool = False,
        requires_transfer: bool = False,
        db: Session = None
    ) -> ChatMessage:
        """Save a message to the database"""
        message = ChatMessage(
            chat_id=chat_id,
            message_type=message_type,
            content=content,
            is_sensitive=is_sensitive,
            requires_transfer=requires_transfer
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_chat_history(chat_id: int, db: Session):
        """Get full chat history"""
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        messages = db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).all()
        return chat, messages

    @staticmethod
    def transfer_to_admin(chat_id: int, admin_id: str, reason: str, db: Session) -> Chat:
        """Transfer chat to admin"""
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            chat.status = ChatStatus.TRANSFERRED
            chat.assigned_admin = admin_id
            db.commit()
            db.refresh(chat)
        return chat

    @staticmethod
    def close_chat(chat_id: int, db: Session) -> Chat:
        """Close a chat session"""
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            chat.status = ChatStatus.CLOSED
            chat.closed_at = datetime.utcnow()
            db.commit()
            db.refresh(chat)
        return chat

    @staticmethod
    def get_pending_chats(db: Session):
        """Get all chats waiting for admin"""
        return db.query(Chat).filter(Chat.status == ChatStatus.TRANSFERRED).all()

    @staticmethod
    def get_admin_chats(admin_id: str, db: Session):
        """Get chats assigned to specific admin"""
        return db.query(Chat).filter(Chat.assigned_admin == admin_id).all()
