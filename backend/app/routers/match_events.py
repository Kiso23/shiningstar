import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.auth import get_current_admin
from app.dependencies.db import get_db
from app.models.admin import Admin
from app.models.match import Match
from app.models.match_event import MatchEvent
from app.schemas.match_event import (
    MatchEventCreate,
    MatchEventUpdate,
    MatchEventResponse,
    MatchEventListResponse,
)

router = APIRouter(prefix="/matches/{match_id}/events", tags=["match-events"])


async def _get_match_with_events(db: AsyncSession, match_id: uuid.UUID) -> Match:
    """Fetch a match with events loaded, or raise 404."""
    result = await db.execute(
        select(Match)
        .options(selectinload(Match.team_a), selectinload(Match.team_b))
        .where(Match.id == match_id)
    )
    match = result.scalar_one_or_none()
    if match is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    return match


@router.get("", response_model=MatchEventListResponse)
async def list_match_events(
    match_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint — get all events for a match with summary stats."""
    # Verify match exists
    await _get_match_with_events(db, match_id)

    # Get all events
    result = await db.execute(
        select(MatchEvent)
        .where(MatchEvent.match_id == match_id)
        .order_by(MatchEvent.time_minute.asc())
    )
    events = result.scalars().all()

    # Calculate stats
    goals_team_a = sum(1 for e in events if e.event_type == "goal" and e.team == "team_a")
    goals_team_b = sum(1 for e in events if e.event_type == "goal" and e.team == "team_b")
    yellow_team_a = sum(1 for e in events if e.event_type == "yellow_card" and e.team == "team_a")
    yellow_team_b = sum(1 for e in events if e.event_type == "yellow_card" and e.team == "team_b")
    red_team_a = sum(1 for e in events if e.event_type == "red_card" and e.team == "team_a")
    red_team_b = sum(1 for e in events if e.event_type == "red_card" and e.team == "team_b")

    return MatchEventListResponse(
        match_id=match_id,
        events=[MatchEventResponse.from_orm(e) for e in events],
        total_goals_team_a=goals_team_a,
        total_goals_team_b=goals_team_b,
        total_yellow_cards_team_a=yellow_team_a,
        total_yellow_cards_team_b=yellow_team_b,
        total_red_cards_team_a=red_team_a,
        total_red_cards_team_b=red_team_b,
    )


@router.post("", response_model=MatchEventResponse, status_code=status.HTTP_201_CREATED)
async def create_match_event(
    match_id: uuid.UUID,
    data: MatchEventCreate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — add an event to a live match."""
    # Verify match exists
    await _get_match_with_events(db, match_id)

    event = MatchEvent(
        match_id=match_id,
        event_type=data.event_type.value,
        team=data.team,
        player_name=data.player_name,
        time_minute=data.time_minute,
        player_replaced=data.player_replaced,
        notes=data.notes,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return MatchEventResponse.from_orm(event)


@router.patch("/{event_id}", response_model=MatchEventResponse)
async def update_match_event(
    match_id: uuid.UUID,
    event_id: uuid.UUID,
    data: MatchEventUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — update a match event."""
    # Verify match exists
    await _get_match_with_events(db, match_id)

    # Get event
    result = await db.execute(
        select(MatchEvent).where(
            (MatchEvent.id == event_id) & (MatchEvent.match_id == match_id)
        )
    )
    event = result.scalar_one_or_none()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    if data.event_type is not None:
        event.event_type = data.event_type.value
    if data.player_name is not None:
        event.player_name = data.player_name
    if data.time_minute is not None:
        event.time_minute = data.time_minute
    if data.player_replaced is not None:
        event.player_replaced = data.player_replaced
    if data.notes is not None:
        event.notes = data.notes

    await db.commit()
    await db.refresh(event)
    return MatchEventResponse.from_orm(event)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match_event(
    match_id: uuid.UUID,
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — delete a match event."""
    # Verify match exists
    await _get_match_with_events(db, match_id)

    # Get and delete event
    result = await db.execute(
        select(MatchEvent).where(
            (MatchEvent.id == event_id) & (MatchEvent.match_id == match_id)
        )
    )
    event = result.scalar_one_or_none()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    await db.delete(event)
    await db.commit()
    return None
