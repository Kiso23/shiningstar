from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime

from app.models.player_recruitment import PlayerRecruitment, PlayerRecruitmentStatus
from app.schemas.player_recruitment import PlayerRecruitmentCreate, PlayerRecruitmentUpdate
from app.config import settings


def _player_to_dict(player: PlayerRecruitment) -> dict:
    """Convert PlayerRecruitment model to dict with UUID as string"""
    # Construct full photo URL if photo_url exists
    photo_url = player.photo_url
    if photo_url and not photo_url.startswith("http"):
        photo_url = f"{settings.API_BASE_URL}{photo_url}"
    
    return {
        'id': str(player.id),
        'full_name': player.full_name,
        'email': player.email,
        'phone': player.phone,
        'age': player.age,
        'date_of_birth': player.date_of_birth,
        'address': player.address,
        'city': player.city,
        'state': player.state,
        'postal_code': player.postal_code,
        'position': player.position.value,
        'jersey_number': player.jersey_number,
        'height': player.height,
        'weight': player.weight,
        'years_of_experience': player.years_of_experience,
        'previous_clubs': player.previous_clubs,
        'achievements': player.achievements,
        'preferred_foot': player.preferred_foot,
        'injuries_or_concerns': player.injuries_or_concerns,
        'additional_notes': player.additional_notes,
        'photo_url': photo_url,
        'status': player.status.value,
        'admin_notes': player.admin_notes,
        'created_at': player.created_at,
        'updated_at': player.updated_at,
    }


async def create_player_recruitment(
    db: AsyncSession,
    data: PlayerRecruitmentCreate,
    photo_url: str | None = None,
) -> dict:
    """Create a new player recruitment application"""
    player = PlayerRecruitment(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        age=data.age,
        date_of_birth=data.date_of_birth,
        address=data.address,
        city=data.city,
        state=data.state,
        postal_code=data.postal_code,
        position=data.position,
        jersey_number=data.jersey_number,
        height=data.height,
        weight=data.weight,
        years_of_experience=data.years_of_experience,
        previous_clubs=data.previous_clubs,
        achievements=data.achievements,
        preferred_foot=data.preferred_foot,
        injuries_or_concerns=data.injuries_or_concerns,
        additional_notes=data.additional_notes,
        photo_url=photo_url,
    )
    db.add(player)
    await db.commit()
    await db.refresh(player)
    
    # Convert to dict with UUID as string
    return _player_to_dict(player)


async def get_player_recruitment_by_id(
    db: AsyncSession,
    player_id: UUID | str,
) -> dict | None:
    """Get player recruitment by ID"""
    result = await db.execute(
        select(PlayerRecruitment).where(PlayerRecruitment.id == player_id)
    )
    player = result.scalars().first()
    return _player_to_dict(player) if player else None


async def list_player_recruitments(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = None,
    position_filter: str | None = None,
) -> list[dict]:
    """List player recruitment applications with optional filters"""
    query = select(PlayerRecruitment)
    
    if status_filter:
        query = query.where(PlayerRecruitment.status == status_filter)
    
    if position_filter:
        query = query.where(PlayerRecruitment.position == position_filter)
    
    query = query.order_by(PlayerRecruitment.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    players = result.scalars().all()
    return [_player_to_dict(p) for p in players]


async def get_player_recruitments_count(
    db: AsyncSession,
    status_filter: str | None = None,
    position_filter: str | None = None,
) -> int:
    """Get count of player recruitment applications"""
    query = select(func.count()).select_from(PlayerRecruitment)
    
    if status_filter:
        query = query.where(PlayerRecruitment.status == status_filter)
    
    if position_filter:
        query = query.where(PlayerRecruitment.position == position_filter)
    
    result = await db.execute(query)
    return result.scalar_one()


async def update_player_recruitment_status(
    db: AsyncSession,
    player_id: UUID | str,
    update_data: PlayerRecruitmentUpdate,
) -> dict | None:
    """Update player recruitment status (admin only)"""
    result = await db.execute(
        select(PlayerRecruitment).where(PlayerRecruitment.id == player_id)
    )
    player = result.scalars().first()
    if not player:
        return None
    
    player.status = update_data.status
    if update_data.admin_notes:
        player.admin_notes = update_data.admin_notes
    
    await db.commit()
    await db.refresh(player)
    return _player_to_dict(player)


async def delete_player_recruitment(
    db: AsyncSession,
    player_id: UUID | str,
) -> bool:
    """Delete player recruitment application"""
    # Get the actual model object, not the dict
    result = await db.execute(
        select(PlayerRecruitment).where(PlayerRecruitment.id == player_id)
    )
    player = result.scalars().first()
    if not player:
        return False
    
    await db.delete(player)
    await db.commit()
    return True
