import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class EventType(str, Enum):
    """Types of match events"""
    goal = "goal"
    yellow_card = "yellow_card"
    red_card = "red_card"
    substitution = "substitution"
    own_goal = "own_goal"


class MatchEvent(Base):
    """Track match events: goals, cards, substitutions, etc."""
    __tablename__ = "match_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    match_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("matches.id"), index=True)
    
    # Event type: goal, yellow_card, red_card, substitution, own_goal
    event_type: Mapped[str] = mapped_column(String(20), index=True)
    
    # Which team scored/got card (team_a or team_b)
    team: Mapped[str] = mapped_column(String(10))  # "team_a" or "team_b"
    
    # Player who scored/got card
    player_name: Mapped[str] = mapped_column(String(100))
    
    # Time in minutes when event occurred
    time_minute: Mapped[int] = mapped_column(Integer)
    
    # Optional: for substitutions, who was replaced
    player_replaced: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Optional: additional notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to Match
    match: Mapped["Match"] = relationship("Match", foreign_keys=[match_id])
