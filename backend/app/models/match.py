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

    team_a: Mapped[Optional["Team"]] = relationship("Team", foreign_keys=[team_a_id])
    team_b: Mapped[Optional["Team"]] = relationship("Team", foreign_keys=[team_b_id])

