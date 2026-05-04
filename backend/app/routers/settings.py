from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_admin
from app.dependencies.db import get_db
from app.models.admin import Admin
from app.models.setting import Setting

router = APIRouter(prefix="/settings", tags=["settings"])

# Default tournament start date (ISO string)
DEFAULT_TOURNAMENT_DATE = "2025-06-15T08:00:00"


class TournamentDateUpdate(BaseModel):
    tournament_start: str  # ISO datetime string e.g. "2025-06-15T08:00:00"


class TournamentDateResponse(BaseModel):
    tournament_start: str


# ── Public: get tournament start date ────────────────────────────────────────

@router.get("/tournament-date", response_model=TournamentDateResponse)
async def get_tournament_date(db: AsyncSession = Depends(get_db)):
    """Public — returns the current tournament start datetime."""
    result = await db.execute(
        select(Setting).where(Setting.key == "tournament_start")
    )
    setting = result.scalar_one_or_none()
    return TournamentDateResponse(
        tournament_start=setting.value if setting else DEFAULT_TOURNAMENT_DATE
    )


# ── Admin: update tournament start date ──────────────────────────────────────

@router.put("/tournament-date", response_model=TournamentDateResponse)
async def update_tournament_date(
    body: TournamentDateUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — update the tournament start datetime."""
    # Validate it's a parseable datetime
    from datetime import datetime
    try:
        datetime.fromisoformat(body.tournament_start)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid datetime format. Use ISO format e.g. 2025-06-15T08:00:00",
        )

    result = await db.execute(
        select(Setting).where(Setting.key == "tournament_start")
    )
    setting = result.scalar_one_or_none()

    if setting:
        setting.value = body.tournament_start
    else:
        db.add(Setting(key="tournament_start", value=body.tournament_start))

    await db.commit()
    return TournamentDateResponse(tournament_start=body.tournament_start)
