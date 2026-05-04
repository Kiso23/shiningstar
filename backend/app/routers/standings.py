from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.db import get_db
from app.models.standing import Standing
from app.schemas.standing import StandingResponse

router = APIRouter(prefix="/standings", tags=["standings"])


@router.get("", response_model=List[StandingResponse])
async def get_standings(db: AsyncSession = Depends(get_db)):
    """
    Public endpoint — return all standings sorted by:
    points desc → goal_difference desc → goals_scored desc → team_name asc
    """
    result = await db.execute(
        select(Standing).options(selectinload(Standing.team))
    )
    standings = result.scalars().all()

    # Sort in Python to apply all tiebreakers including team_name
    sorted_standings = sorted(
        standings,
        key=lambda s: (
            -s.points,
            -(s.goals_scored - s.goals_conceded),  # goal_difference desc
            -s.goals_scored,
            s.team.team_name,  # alphabetical asc
        ),
    )

    return [
        StandingResponse(
            team_id=s.team_id,
            team_name=s.team.team_name,
            team_logo=s.team.logo_path,
            played=s.played,
            wins=s.wins,
            draws=s.draws,
            losses=s.losses,
            goals_scored=s.goals_scored,
            goals_conceded=s.goals_conceded,
            goal_difference=s.goal_difference,
            points=s.points,
        )
        for s in sorted_standings
    ]
