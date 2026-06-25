import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class EventType(str, Enum):
    goal = "goal"
    yellow_card = "yellow_card"
    red_card = "red_card"
    substitution = "substitution"
    own_goal = "own_goal"


class MatchEventCreate(BaseModel):
    """Create a new match event (admin only)"""
    event_type: EventType
    team: str = Field(..., pattern="^(team_a|team_b)$", description="team_a or team_b")
    player_name: str = Field(..., min_length=1, max_length=100)
    time_minute: int = Field(..., ge=0, le=200, description="Time in minutes (0-200)")
    player_replaced: Optional[str] = Field(None, max_length=100, description="For substitutions only")
    notes: Optional[str] = Field(None, max_length=500)


class MatchEventUpdate(BaseModel):
    """Update a match event"""
    event_type: Optional[EventType] = None
    player_name: Optional[str] = Field(None, min_length=1, max_length=100)
    time_minute: Optional[int] = Field(None, ge=0, le=200)
    player_replaced: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)


class MatchEventResponse(BaseModel):
    """Response for a match event"""
    id: uuid.UUID
    match_id: uuid.UUID
    event_type: str
    team: str
    player_name: str
    time_minute: int
    player_replaced: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MatchEventListResponse(BaseModel):
    """List of match events for a specific match"""
    match_id: uuid.UUID
    events: list[MatchEventResponse]
    total_goals_team_a: int
    total_goals_team_b: int
    total_yellow_cards_team_a: int
    total_yellow_cards_team_b: int
    total_red_cards_team_a: int
    total_red_cards_team_b: int
