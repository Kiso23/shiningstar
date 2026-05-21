from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactResponse, ContactReply
from app.services import contact_service
from app.services.email_service import send_contact_notification, send_contact_reply

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    data: ContactCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create a new contact message (public endpoint)."""
    contact = await contact_service.create_contact(db, data)
    
    # Send notification email to admin in background
    background_tasks.add_task(
        send_contact_notification,
        contact_name=contact.name,
        contact_email=contact.email,
        contact_phone=contact.phone,
        subject=contact.subject,
        message=contact.message,
    )
    
    return contact


@router.get("/admin/contacts", response_model=list[ContactResponse])
async def list_contacts(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """List all contacts (admin only)."""
    query = select(Contact)
    
    if status_filter:
        query = query.where(Contact.status == status_filter)
    
    query = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    contacts = result.scalars().all()
    
    return contacts


@router.get("/admin/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Get a specific contact (admin only)."""
    contact = await contact_service.get_contact_by_id(db, contact_id)
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    
    # Mark as read
    if contact.status == "new":
        contact.status = "read"
        await db.commit()
    
    return contact


@router.patch("/admin/contacts/{contact_id}/reply", response_model=ContactResponse)
async def reply_to_contact(
    contact_id: str,
    reply_data: ContactReply,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Reply to a contact message (admin only)."""
    contact = await contact_service.update_contact_status(
        db, contact_id, reply_data.status, reply_data.admin_reply
    )
    
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    
    # Send reply email in background
    background_tasks.add_task(
        send_contact_reply,
        to_email=contact.email,
        contact_name=contact.name,
        subject=contact.subject,
        admin_reply=reply_data.admin_reply,
    )
    
    return contact


@router.patch("/admin/contacts/{contact_id}/status", response_model=ContactResponse)
async def update_contact_status(
    contact_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Update contact status (admin only)."""
    contact = await contact_service.update_contact_status(db, contact_id, status)
    
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    
    return contact


@router.delete("/admin/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Delete a contact (admin only)."""
    success = await contact_service.delete_contact(db, contact_id)
    
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    
    return None


@router.get("/admin/contacts-count")
async def get_contacts_count(
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Get count of contacts by status (admin only)."""
    query = select(func.count()).select_from(Contact)
    
    if status_filter:
        query = query.where(Contact.status == status_filter)
    
    result = await db.execute(query)
    count = result.scalar_one()
    
    return {"count": count}
