import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.auth import get_current_admin
from app.dependencies.db import get_db
from app.models.admin import Admin
from app.models.match import Match
from app.models.team import Team
from app.schemas.match import MatchCreate, MatchUpdate, MatchResponse, ScoreUpdate
from app.services.standings_service import recalculate_standings
from app.services.bracket_service import generate_bracket, advance_winner

router = APIRouter(prefix="/matches", tags=["matches"])


def _to_response(match: Match) -> MatchResponse:
    """Convert a Match ORM object to MatchResponse, denormalizing team names."""
    return MatchResponse(
        id=match.id,
        team_a_id=match.team_a_id,
        team_b_id=match.team_b_id,
        team_a_name=match.team_a.team_name if match.team_a else "TBD",
        team_b_name=match.team_b.team_name if match.team_b else "TBD",
        team_a_score=match.team_a_score,
        team_b_score=match.team_b_score,
        team_a_logo=match.team_a_logo,
        team_b_logo=match.team_b_logo,
        status=match.status,
        round=match.round,
        group=match.group,
        scheduled_at=match.scheduled_at,
        venue=match.venue,
        bracket_slot=match.bracket_slot,
        next_match_id=match.next_match_id,
    )


async def _get_match_with_teams(db: AsyncSession, match_id: uuid.UUID) -> Match:
    """Fetch a match with team relationships loaded, or raise 404."""
    result = await db.execute(
        select(Match)
        .options(selectinload(Match.team_a), selectinload(Match.team_b))
        .where(Match.id == match_id)
    )
    match = result.scalar_one_or_none()
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return match


@router.get("", response_model=List[MatchResponse])
async def list_matches(
    round: Optional[str] = Query(None),
    match_status: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint — list all fixtures ordered by scheduled_at ascending."""
    query = (
        select(Match)
        .options(selectinload(Match.team_a), selectinload(Match.team_b))
        .order_by(Match.scheduled_at.asc())
    )
    if round:
        query = query.where(Match.round == round)
    if match_status:
        query = query.where(Match.status == match_status)

    result = await db.execute(query)
    matches = result.scalars().all()
    return [_to_response(m) for m in matches]


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Public endpoint — get a single match by ID."""
    match = await _get_match_with_teams(db, match_id)
    return _to_response(match)


@router.post("", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(
    data: MatchCreate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — create a new fixture."""
    # Validate both teams exist
    for team_id in (data.team_a_id, data.team_b_id):
        result = await db.execute(select(Team).where(Team.id == team_id))
        if result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Team not found: {team_id}",
            )

    match = Match(
        team_a_id=data.team_a_id,
        team_b_id=data.team_b_id,
        scheduled_at=data.scheduled_at.replace(tzinfo=None),
        venue=data.venue,
        round=data.round,
        group=data.group,
        team_a_logo=data.team_a_logo,
        team_b_logo=data.team_b_logo,
    )
    db.add(match)
    await db.flush()  # get the ID without committing

    # Reload with relationships
    await db.refresh(match)
    result = await db.execute(
        select(Match)
        .options(selectinload(Match.team_a), selectinload(Match.team_b))
        .where(Match.id == match.id)
    )
    match = result.scalar_one()
    await db.commit()
    return _to_response(match)


@router.patch("/{match_id}", response_model=MatchResponse)
async def update_match(
    match_id: uuid.UUID,
    data: MatchUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — update fixture fields (venue, time, round, group)."""
    match = await _get_match_with_teams(db, match_id)

    if data.scheduled_at is not None:
        match.scheduled_at = data.scheduled_at.replace(tzinfo=None)
    if data.venue is not None:
        match.venue = data.venue
    if data.round is not None:
        match.round = data.round
    if data.group is not None:
        match.group = data.group
    if data.team_a_logo is not None:
        match.team_a_logo = data.team_a_logo
    if data.team_b_logo is not None:
        match.team_b_logo = data.team_b_logo

    await db.commit()
    await db.refresh(match)

    result = await db.execute(
        select(Match)
        .options(selectinload(Match.team_a), selectinload(Match.team_b))
        .where(Match.id == match_id)
    )
    match = result.scalar_one()
    return _to_response(match)


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match(
    match_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — delete a fixture."""
    match = await _get_match_with_teams(db, match_id)
    await db.delete(match)
    await db.commit()
    return None


@router.patch("/{match_id}/score", response_model=MatchResponse)
async def update_score(
    match_id: uuid.UUID,
    data: ScoreUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — update scores and/or status. Triggers standing recalculation when completed."""
    match = await _get_match_with_teams(db, match_id)

    # Reject score updates on already-completed matches (unless changing status away from completed)
    if match.status == "completed" and data.status != "live" and data.status != "scheduled":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot update score: match is already completed",
        )

    if data.team_a_score is not None:
        match.team_a_score = data.team_a_score
    if data.team_b_score is not None:
        match.team_b_score = data.team_b_score
    if data.status is not None:
        match.status = data.status.value

    # Recalculate standings when match is completed
    if match.status == "completed":
        if match.team_a_score is None or match.team_b_score is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both scores must be set before marking a match as completed",
            )
        await recalculate_standings(db, match.team_a_id, match.team_b_id)
        # Auto-advance winner in knockout bracket
        await advance_winner(db, match)

    await db.commit()

    result = await db.execute(
        select(Match)
        .options(selectinload(Match.team_a), selectinload(Match.team_b))
        .where(Match.id == match_id)
    )
    match = result.scalar_one()
    return _to_response(match)


# ── Bracket generation ────────────────────────────────────────────────────────

from pydantic import BaseModel as _BaseModel

class BracketGenerateRequest(_BaseModel):
    venue: str = "Rongbong Ronghang Playground"
    first_match_time: Optional[datetime] = None


@router.post("/generate-bracket", status_code=status.HTTP_201_CREATED)
async def generate_knockout_bracket(
    data: BracketGenerateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """
    Admin-only — generate a full single-elimination knockout bracket
    from all approved teams. Clears existing matches first.
    """
    # Get all approved teams
    result = await db.execute(
        select(Team).where(Team.status == "approved")
    )
    teams = result.scalars().all()

    if len(teams) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Need at least 2 approved teams. Found {len(teams)}.",
        )

    # Delete all existing matches
    existing = await db.execute(select(Match))
    for m in existing.scalars().all():
        await db.delete(m)
    await db.flush()

    # Generate bracket
    first_time = data.first_match_time.replace(tzinfo=None) if data.first_match_time else None
    matches = await generate_bracket(db, list(teams), venue=data.venue, first_match_time=first_time)
    await db.commit()

    return {
        "message": f"Bracket generated with {len(matches)} matches for {len(teams)} teams.",
        "total_matches": len(matches),
        "total_teams": len(teams),
    }
