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
DEFAULT_TOURNAMENT_DATE = "2026-07-08T08:00:00"
DEFAULT_BANNER_LINE1 = "Shining Star United FC"
DEFAULT_BANNER_LINE2 = "Football Tournament"
DEFAULT_HERO_LINE1 = "Shining"
DEFAULT_HERO_LINE2 = "Star"
DEFAULT_HERO_LINE3 = "United FC"
DEFAULT_UPI_ID = "sarlongkisarlongki143@okhdfcbank"


class TournamentDateUpdate(BaseModel):
    tournament_start: str  # ISO datetime string e.g. "2025-06-15T08:00:00"


class BannerUpdate(BaseModel):
    banner_line1: str
    banner_line2: str


class TournamentDateResponse(BaseModel):
    tournament_start: str


class BannerResponse(BaseModel):
    banner_line1: str
    banner_line2: str


class AllSettingsResponse(BaseModel):
    tournament_start: str
    banner_line1: str
    banner_line2: str
    hero_line1: str
    hero_line2: str
    hero_line3: str
    upi_id: str


class UpiIdResponse(BaseModel):
    upi_id: str


class UpiIdUpdate(BaseModel):
    upi_id: str


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


# ── Public: get all settings at once ─────────────────────────────────────────

@router.get("/all", response_model=AllSettingsResponse)
async def get_all_settings(db: AsyncSession = Depends(get_db)):
    """Public — returns all site settings in one call."""
    result = await db.execute(select(Setting))
    rows = {s.key: s.value for s in result.scalars().all()}
    return AllSettingsResponse(
        tournament_start=rows.get("tournament_start", DEFAULT_TOURNAMENT_DATE),
        banner_line1=rows.get("banner_line1", DEFAULT_BANNER_LINE1),
        banner_line2=rows.get("banner_line2", DEFAULT_BANNER_LINE2),
        hero_line1=rows.get("hero_line1", DEFAULT_HERO_LINE1),
        hero_line2=rows.get("hero_line2", DEFAULT_HERO_LINE2),
        hero_line3=rows.get("hero_line3", DEFAULT_HERO_LINE3),
        upi_id=rows.get("upi_id", DEFAULT_UPI_ID),
    )


# ── Public: get banner text ───────────────────────────────────────────────────

@router.get("/banner", response_model=BannerResponse)
async def get_banner(db: AsyncSession = Depends(get_db)):
    """Public — returns the homepage banner text."""
    result = await db.execute(select(Setting))
    rows = {s.key: s.value for s in result.scalars().all()}
    return BannerResponse(
        banner_line1=rows.get("banner_line1", DEFAULT_BANNER_LINE1),
        banner_line2=rows.get("banner_line2", DEFAULT_BANNER_LINE2),
    )


# ── Admin: update banner text ─────────────────────────────────────────────────

@router.put("/banner", response_model=BannerResponse)
async def update_banner(
    body: BannerUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — update the homepage banner text."""
    result = await db.execute(select(Setting))
    rows = {s.key: s for s in result.scalars().all()}

    for key, value in [("banner_line1", body.banner_line1), ("banner_line2", body.banner_line2)]:
        if key in rows:
            rows[key].value = value
        else:
            db.add(Setting(key=key, value=value))

    await db.commit()
    return BannerResponse(banner_line1=body.banner_line1, banner_line2=body.banner_line2)


class HeroUpdate(BaseModel):
    hero_line1: str
    hero_line2: str
    hero_line3: str


class HeroResponse(BaseModel):
    hero_line1: str
    hero_line2: str
    hero_line3: str


@router.put("/hero", response_model=HeroResponse)
async def update_hero(
    body: HeroUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — update the homepage hero title text."""
    result = await db.execute(select(Setting))
    rows = {s.key: s for s in result.scalars().all()}

    for key, value in [
        ("hero_line1", body.hero_line1),
        ("hero_line2", body.hero_line2),
        ("hero_line3", body.hero_line3),
    ]:
        if key in rows:
            rows[key].value = value
        else:
            db.add(Setting(key=key, value=value))

    await db.commit()
    return HeroResponse(hero_line1=body.hero_line1, hero_line2=body.hero_line2, hero_line3=body.hero_line3)


# ── Public: get UPI ID ───────────────────────────────────────────────────────

@router.get("/upi-id", response_model=UpiIdResponse)
async def get_upi_id(db: AsyncSession = Depends(get_db)):
    """Public — returns the UPI ID for payment."""
    result = await db.execute(
        select(Setting).where(Setting.key == "upi_id")
    )
    setting = result.scalar_one_or_none()
    return UpiIdResponse(
        upi_id=setting.value if setting else DEFAULT_UPI_ID
    )


# ── Admin: update UPI ID ─────────────────────────────────────────────────────

@router.put("/upi-id", response_model=UpiIdResponse)
async def update_upi_id(
    body: UpiIdUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — update the UPI ID for payment."""
    if not body.upi_id or "@" not in body.upi_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UPI ID format. Must be in format: username@bank",
        )
    
    result = await db.execute(
        select(Setting).where(Setting.key == "upi_id")
    )
    setting = result.scalar_one_or_none()

    if setting:
        setting.value = body.upi_id
    else:
        db.add(Setting(key="upi_id", value=body.upi_id))

    await db.commit()
    return UpiIdResponse(upi_id=body.upi_id)
