from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatResponse,
    ChatHistoryResponse,
    TransferToAdminRequest,
    AdminRespondRequest
)
from app.services.chat_service import ChatService
from app.models.chat import MessageType, Chat, ChatMessage
import uuid

router = APIRouter(prefix="/chat", tags=["chat"])


async def get_db() -> AsyncSession:
    """Dependency to get async database session"""
    async with AsyncSessionLocal() as session:
        yield session


@router.post("/message")
async def send_message(
    payload: ChatMessageCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message to the chat system.
    AI processes common questions, transfers sensitive ones to admin.
    """
    # Get or create chat session
    chat = await ChatService.get_or_create_chat(payload.session_id, db)

    # Update chat with user info if provided
    if payload.team_name:
        chat.team_name = payload.team_name
    if payload.email:
        chat.email = payload.email
    if payload.phone:
        chat.phone = payload.phone
    await db.commit()

    # Save user message
    user_message = await ChatService.save_message(
        chat_id=chat.id,
        message_type=MessageType.USER,
        content=payload.content,
        db=db
    )

    # Get AI response
    ai_response, requires_transfer = ChatService.get_ai_response(payload.content)

    # Save AI response
    ai_message = await ChatService.save_message(
        chat_id=chat.id,
        message_type=MessageType.AI,
        content=ai_response,
        is_sensitive=requires_transfer,
        requires_transfer=requires_transfer,
        db=db
    )

    # Transfer to admin if needed
    if requires_transfer:
        await ChatService.transfer_to_admin(
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
async def get_chat_history(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get full chat history for a session"""
    chat = await ChatService.get_or_create_chat(session_id, db)
    result = await db.execute(
        select(ChatMessage).filter(ChatMessage.chat_id == chat.id)
    )
    messages = result.scalars().all()

    return {
        "chat": chat,
        "messages": messages
    }


@router.post("/transfer")
async def transfer_to_admin(
    payload: TransferToAdminRequest,
    db: AsyncSession = Depends(get_db)
):
    """Manually transfer chat to admin"""
    chat = await ChatService.transfer_to_admin(
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
async def admin_respond(
    payload: AdminRespondRequest,
    db: AsyncSession = Depends(get_db)
):
    """Admin sends a response to a chat"""
    result = await db.execute(select(Chat).filter(Chat.id == payload.chat_id))
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Save admin message
    admin_message = await ChatService.save_message(
        chat_id=chat.id,
        message_type=MessageType.ADMIN,
        content=payload.message,
        db=db
    )

    return {
        "success": True,
        "message": admin_message,
        "chat_id": chat.id
    }


@router.get("/admin/pending")
async def get_pending_chats(db: AsyncSession = Depends(get_db)):
    """Get all chats waiting for admin"""
    chats = await ChatService.get_pending_chats(db)
    return {"pending_chats": chats, "count": len(chats)}


@router.get("/admin/assigned/{admin_id}")
async def get_admin_chats(admin_id: str, db: AsyncSession = Depends(get_db)):
    """Get chats assigned to specific admin"""
    chats = await ChatService.get_admin_chats(admin_id, db)
    return {"chats": chats, "count": len(chats)}


@router.post("/close/{chat_id}")
async def close_chat(chat_id: int, db: AsyncSession = Depends(get_db)):
    """Close a chat session"""
    chat = await ChatService.close_chat(chat_id, db)
    return {
        "success": True,
        "chat_id": chat.id,
        "status": chat.status,
        "closed_at": chat.closed_at
    }
