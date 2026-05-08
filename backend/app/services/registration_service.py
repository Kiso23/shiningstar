import random
import string
from datetime import datetime
from typing import List, Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.team import Team
from app.models.player import Player
from app.schemas.common import RegistrationStatus
from app.schemas.player import PlayerCreate
from app.schemas.team import TeamCreate
from app.utils.sanitize import sanitize_text

# Valid forward-only status transitions
VALID_TRANSITIONS = {
    RegistrationStatus.pending: {RegistrationStatus.payment_submitted, RegistrationStatus.rejected},
    RegistrationStatus.payment_submitted: {RegistrationStatus.approved, RegistrationStatus.rejected},
    RegistrationStatus.approved: set(),
    RegistrationStatus.rejected: set(),
}


def generate_registration_id() -> str:
    """Generate a unique registration ID in the format SSU-{YYYYMMDD}-{6-char-random-uppercase}."""
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"SSU-{date_str}-{random_suffix}"


async def create_team(db: AsyncSession, data: TeamCreate, logo_path: Optional[str] = None) -> Team:
    """Create a new team registration with sanitized fields."""
    team = Team(
        registration_id=generate_registration_id(),
        team_name=sanitize_text(data.team_name),
        manager_name=sanitize_text(data.manager_name),
        contact_phone=data.contact_phone,
        contact_email=data.contact_email,
        player_count=data.player_count,
        address=sanitize_text(data.address) if data.address else None,
        logo_path=logo_path,
        status=RegistrationStatus.pending.value,
    )
    db.add(team)
    await db.flush()
    await db.refresh(team)
    return team


async def create_players(
    db: AsyncSession, team_id: uuid.UUID, players: List[PlayerCreate]
) -> List[Player]:
    """Bulk insert player records associated with a team."""
    player_objects = [
        Player(
            team_id=team_id,
            full_name=sanitize_text(p.full_name),
            age=p.age,
            jersey_number=p.jersey_number,
            position=p.position,
            position_index=idx,
        )
        for idx, p in enumerate(players)
    ]
    db.add_all(player_objects)
    await db.flush()
    for p in player_objects:
        await db.refresh(p)
    return player_objects


async def get_team_by_registration_id(db: AsyncSession, registration_id: str) -> Optional[Team]:
    """Fetch a team by its human-readable registration ID."""
    result = await db.execute(
        select(Team).where(Team.registration_id == registration_id)
    )
    return result.scalar_one_or_none()


async def get_team_by_id(db: AsyncSession, team_id: uuid.UUID) -> Optional[Team]:
    """Fetch a team by its UUID primary key."""
    result = await db.execute(select(Team).where(Team.id == team_id))
    return result.scalar_one_or_none()


async def update_team_status(
    db: AsyncSession, team_id: uuid.UUID, new_status: RegistrationStatus
) -> Team:
    """
    Update a team's status, enforcing forward-only transitions.
    Raises 409 Conflict if the transition is not allowed.
    Raises 404 if the team is not found.
    """
    team = await get_team_by_id(db, team_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    current_status = RegistrationStatus(team.status)
    allowed_next = VALID_TRANSITIONS.get(current_status, set())

    if new_status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot transition from '{current_status.value}' to '{new_status.value}'",
        )

    team.status = new_status.value
    team.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(team)
    return team
