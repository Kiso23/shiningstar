from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.contact import Contact
from app.schemas.contact import ContactCreate


async def create_contact(db: AsyncSession, data: ContactCreate) -> Contact:
    """Create a new contact message."""
    contact = Contact(
        name=data.name,
        email=data.email,
        phone=data.phone,
        subject=data.subject,
        message=data.message,
        status="new",
    )
    db.add(contact)
    await db.flush()
    await db.refresh(contact)
    return contact


async def get_contact_by_id(db: AsyncSession, contact_id: str) -> Contact | None:
    """Get a contact by ID."""
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    return result.scalar_one_or_none()


async def get_all_contacts(db: AsyncSession, skip: int = 0, limit: int = 50) -> list[Contact]:
    """Get all contacts with pagination."""
    result = await db.execute(
        select(Contact).order_by(Contact.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def update_contact_status(db: AsyncSession, contact_id: str, status: str, admin_reply: str | None = None) -> Contact | None:
    """Update contact status and optionally add admin reply."""
    contact = await get_contact_by_id(db, contact_id)
    if not contact:
        return None
    
    contact.status = status
    if admin_reply:
        contact.admin_reply = admin_reply
    
    await db.commit()
    await db.refresh(contact)
    return contact


async def delete_contact(db: AsyncSession, contact_id: str) -> bool:
    """Delete a contact."""
    contact = await get_contact_by_id(db, contact_id)
    if not contact:
        return False
    
    await db.delete(contact)
    await db.commit()
    return True
