"""
Standings recalculation service.
Recalculates standings from scratch for both teams whenever a match is completed or revised.
"""
import uuid
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import Match
from app.models.standing import Standing


async def recalculate_standings(
    db: AsyncSession,
    team_a_id: uuid.UUID,
    team_b_id: uuid.UUID,
) -> None:
    """
    Recalculate standings for both teams from all their completed matches.
    Called after any match is marked completed or a completed result is revised.
    Runs inside the caller's transaction — if it fails, the whole transaction rolls back.
    """
    for team_id in (team_a_id, team_b_id):
        await _recalculate_for_team(db, team_id)


async def _recalculate_for_team(db: AsyncSession, team_id: uuid.UUID) -> None:
    """Recalculate and upsert the Standing row for a single team."""
    # Fetch all completed matches involving this team
    result = await db.execute(
        select(Match).where(
            Match.status == "completed",
            or_(Match.team_a_id == team_id, Match.team_b_id == team_id),
        )
    )
    completed_matches = result.scalars().all()

    # Recalculate from scratch
    played = 0
    wins = 0
    draws = 0
    losses = 0
    goals_scored = 0
    goals_conceded = 0
    points = 0

    for match in completed_matches:
        if match.team_a_score is None or match.team_b_score is None:
            continue  # skip matches without scores

        played += 1

        if match.team_a_id == team_id:
            gs = match.team_a_score
            gc = match.team_b_score
        else:
            gs = match.team_b_score
            gc = match.team_a_score

        goals_scored += gs
        goals_conceded += gc

        if gs > gc:
            wins += 1
            points += 3
        elif gs == gc:
            draws += 1
            points += 1
        else:
            losses += 1

    # Upsert the Standing row
    standing_result = await db.execute(
        select(Standing).where(Standing.team_id == team_id)
    )
    standing = standing_result.scalar_one_or_none()

    if standing is None:
        standing = Standing(
            team_id=team_id,
            played=played,
            wins=wins,
            draws=draws,
            losses=losses,
            goals_scored=goals_scored,
            goals_conceded=goals_conceded,
            points=points,
        )
        db.add(standing)
    else:
        standing.played = played
        standing.wins = wins
        standing.draws = draws
        standing.losses = losses
        standing.goals_scored = goals_scored
        standing.goals_conceded = goals_conceded
        standing.points = points
