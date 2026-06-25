import hashlib
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy import func, select, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_admin
from app.dependencies.db import get_db
from app.models.admin import Admin
from app.models.page_view import PageView

router = APIRouter(prefix="/analytics", tags=["analytics"])

VALID_PAGES = {"home", "fixtures", "live", "leaderboard", "register"}


# ── Schemas ───────────────────────────────────────────────────────────────────

class TrackRequest(BaseModel):
    page: str
    device: str = "unknown"


class DailyStat(BaseModel):
    date: str
    visits: int


class PageStat(BaseModel):
    page: str
    visits: int


class AnalyticsSummary(BaseModel):
    total_visits: int
    unique_visitors: int
    today_visits: int
    by_page: List[PageStat]
    last_7_days: List[DailyStat]


class TopScorerStat(BaseModel):
    player_name: str
    team_name: str
    goals: int
    assists: int


class TopScorersResponse(BaseModel):
    top_scorers: List[TopScorerStat]
    top_assists: List[TopScorerStat]


# ── Public: track a visit ─────────────────────────────────────────────────────

@router.post("/track", status_code=204)
async def track_visit(
    body: TrackRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Called by the frontend on every page load. Stores a hashed visit record."""
    page = body.page if body.page in VALID_PAGES else "other"

    # Hash the IP — no PII stored
    raw_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    ip = raw_ip.split(",")[0].strip()
    visitor_hash = hashlib.sha256(ip.encode()).hexdigest()

    device = body.device if body.device in ("mobile", "desktop") else "unknown"

    view = PageView(page=page, visitor_hash=visitor_hash, device=device)
    db.add(view)
    await db.commit()


# ── Admin: get analytics summary ─────────────────────────────────────────────

@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Admin-only — returns visit stats."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=6)

    # Total visits
    total_result = await db.execute(select(func.count()).select_from(PageView))
    total_visits = total_result.scalar_one()

    # Unique visitors
    unique_result = await db.execute(
        select(func.count(func.distinct(PageView.visitor_hash)))
    )
    unique_visitors = unique_result.scalar_one()

    # Today's visits — compare naive datetimes
    today_result = await db.execute(
        select(func.count()).select_from(PageView)
        .where(PageView.visited_at >= today_start)
    )
    today_visits = today_result.scalar_one()

    # Visits by page
    page_result = await db.execute(
        select(PageView.page, func.count().label("visits"))
        .group_by(PageView.page)
        .order_by(func.count().desc())
    )
    by_page = [PageStat(page=row.page, visits=row.visits) for row in page_result]

    # Last 7 days — cast to Date to group by day
    daily_result = await db.execute(
        select(
            cast(PageView.visited_at, Date).label("day"),
            func.count().label("visits"),
        )
        .where(PageView.visited_at >= week_start)
        .group_by(cast(PageView.visited_at, Date))
        .order_by(cast(PageView.visited_at, Date))
    )
    daily_counts: dict[str, int] = {}
    for row in daily_result:
        daily_counts[row.day.strftime("%Y-%m-%d")] = row.visits

    last_7_days = []
    for i in range(6, -1, -1):
        day = (today_start - timedelta(days=i)).strftime("%Y-%m-%d")
        last_7_days.append(DailyStat(date=day, visits=daily_counts.get(day, 0)))

    return AnalyticsSummary(
        total_visits=total_visits,
        unique_visitors=unique_visitors,
        today_visits=today_visits,
        by_page=by_page,
        last_7_days=last_7_days,
    )


# ── Public: get top scorers and assists ───────────────────────────────────────

@router.get("/top-scorers", response_model=TopScorersResponse)
async def get_top_scorers(db: AsyncSession = Depends(get_db)):
    """
    Get top goal scorers and top assist providers from all match events.
    Public endpoint — no admin auth required.
    """
    from app.models.match_event import MatchEvent
    from app.models.match import Match
    from app.models.team import Team
    from sqlalchemy import or_

    # Get top scorers
    scorer_result = await db.execute(
        select(
            MatchEvent.player_name,
            Team.team_name,
            func.count().label("goals"),
        )
        .select_from(MatchEvent)
        .join(Match, MatchEvent.match_id == Match.id)
        .join(
            Team,
            or_(
                (MatchEvent.team == "team_a") & (Match.team_a_id == Team.id),
                (MatchEvent.team == "team_b") & (Match.team_b_id == Team.id)
            )
        )
        .where(MatchEvent.event_type == "goal")
        .group_by(MatchEvent.player_name, Team.team_name)
        .order_by(func.count().desc())
        .limit(10)
    )

    top_scorers = [
        TopScorerStat(
            player_name=row.player_name,
            team_name=row.team_name,
            goals=row.goals,
            assists=0,
        )
        for row in scorer_result
    ]

    # Get top assists (stored in player_replaced field for assists)
    # For now, we'll show zero assists until assist feature is implemented
    top_assists = []

    return TopScorersResponse(top_scorers=top_scorers, top_assists=top_assists)
