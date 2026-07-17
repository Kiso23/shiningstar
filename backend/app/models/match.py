import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Team references - nullable to allow manual teams
    team_a_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    team_b_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    # Manual team names - used when team_id is null
    team_a_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    team_b_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    team_a_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    team_b_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    team_a_logo: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    team_b_logo: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    status: Mapped[str] = mapped_column(String(20), default="scheduled", index=True)
    # status values: "scheduled" | "live" | "completed"
    round: Mapped[str] = mapped_column(String(50))
    # round values: "Round of 32" | "Round of 16" | "Quarter-Final" | "Semi-Final" | "Final"
    group: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    venue: Mapped[str] = mapped_column(String(200))

    # Knockout bracket tracking
    # bracket_slot: position in the bracket (1-based, e.g. match 1 of Round of 32)
    bracket_slot: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    # next_match_id: the match this winner advances to
    next_match_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("matches.id", use_alter=True, name="fk_next_match"), nullable=True
    )
    # next_match_slot: "a" or "b" — which slot the winner fills in the next match
    next_match_slot: Mapped[Optional[str]] = mapped_column(String(1), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Match timing
    match_start_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    match_end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    
    # Timer display control (for admin)
    # current_minute: which minute to display (0-90 or 90-120 for extra time)
    # is_extra_time: whether showing extra time (True = 90+, False = 0-45 or 45-90)
    # is_paused: whether timer is paused
    current_minute: Mapped[int] = mapped_column(Integer, default=0)
    is_extra_time: Mapped[bool] = mapped_column(default=False)
    is_paused: Mapped[bool] = mapped_column(default=False)

    team_a: Mapped[Optional["Team"]] = relationship("Team", foreign_keys=[team_a_id])
    team_b: Mapped[Optional["Team"]] = relationship("Team", foreign_keys=[team_b_id])

