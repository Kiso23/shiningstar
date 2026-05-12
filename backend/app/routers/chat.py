from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatResponse,
    ChatHistoryResponse,
    TransferToAdminRequest
)
from app.services.chat_service import ChatService
from app.models.chat import MessageType, Chat, ChatMessage
import uuid

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("/message")
def send_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db)
):
    """
    Send a message to the chat system.
    AI processes common questions, transfers sensitive ones to admin.
    """
    # Get or create chat session
    chat = ChatService.get_or_create_chat(payload.session_id, db)

    # Update chat with user info if provided
    if payload.team_name:
        chat.team_name = payload.team_name
    if payload.email:
        chat.email = payload.email
    if payload.phone:
        chat.phone = payload.phone
    db.commit()

    # Save user message
    user_message = ChatService.save_message(
        chat_id=chat.id,
        message_type=MessageType.USER,
        content=payload.content,
        db=db
    )

    # Get AI response
    ai_response, requires_transfer = ChatService.get_ai_response(payload.content)

    # Save AI response
    ai_message = ChatService.save_message(
        chat_id=chat.id,
        message_type=MessageType.AI,
        content=ai_response,
        is_sensitive=requires_transfer,
        requires_transfer=requires_transfer,
        db=db
    )

    # Transfer to admin if needed
    if requires_transfer:
        ChatService.transfer_to_admin(
            chat_id=chat.id,
            admin_id="pending",
            reason="Requires admin assistance",
            db=db
        )

    return {
        "chat_id": chat.id,
        "session_id": chat.session_id,
        "user_message": user_message,
        "ai_response": ai_message,
        "requires_transfer": requires_transfer,
        "status": chat.status
    }


@router.get("/history/{session_id}")
def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get full chat history for a session"""
    chat = ChatService.get_or_create_chat(session_id, db)
    messages = db.query(ChatMessage).filter(
        ChatMessage.chat_id == chat.id
    ).all()

    return {
        "chat": chat,
        "messages": messages
    }


@router.post("/transfer")
def transfer_to_admin(
    payload: TransferToAdminRequest,
    db: Session = Depends(get_db)
):
    """Manually transfer chat to admin"""
    chat = ChatService.transfer_to_admin(
        chat_id=payload.chat_id,
        admin_id=payload.admin_id or "unassigned",
        reason=payload.reason,
        db=db
    )

    return {
        "success": True,
        "chat_id": chat.id,
        "status": chat.status,
        "assigned_admin": chat.assigned_admin
    }


@router.post("/admin/respond")
def admin_respond(
    chat_id: int,
    admin_id: str,
    message: str,
    db: Session = Depends(get_db)
):
    """Admin sends a response to a chat"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Save admin message
    admin_message = ChatService.save_message(
        chat_id=chat.id,
        message_type=MessageType.ADMIN,
        content=message,
        db=db
    )

    return {
        "success": True,
        "message": admin_message,
        "chat_id": chat.id
    }


@router.get("/admin/pending")
def get_pending_chats(db: Session = Depends(get_db)):
    """Get all chats waiting for admin"""
    chats = ChatService.get_pending_chats(db)
    return {"pending_chats": chats, "count": len(chats)}


@router.get("/admin/assigned/{admin_id}")
def get_admin_chats(admin_id: str, db: Session = Depends(get_db)):
    """Get chats assigned to specific admin"""
    chats = ChatService.get_admin_chats(admin_id, db)
    return {"chats": chats, "count": len(chats)}


@router.post("/close/{chat_id}")
def close_chat(chat_id: int, db: Session = Depends(get_db)):
    """Close a chat session"""
    chat = ChatService.close_chat(chat_id, db)
    return {
        "success": True,
        "chat_id": chat.id,
        "status": chat.status,
        "closed_at": chat.closed_at
    }
