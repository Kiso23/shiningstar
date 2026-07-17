import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, model_validator, ConfigDict


VALID_ROUNDS = [
    "Round of 32",
    "Round of 16",
    "Quarter-Final",
    "Semi-Final",
    "Final",
    "Third Place",
]


class MatchStatus(str, Enum):
    scheduled = "scheduled"
    live = "live"
    completed = "completed"


class MatchCreate(BaseModel):
    team_a_id: Optional[uuid.UUID] = None
    team_b_id: Optional[uuid.UUID] = None
    team_a_name: Optional[str] = Field(None, min_length=1, max_length=100)
    team_b_name: Optional[str] = Field(None, min_length=1, max_length=100)
    scheduled_at: datetime
    venue: str = Field(..., min_length=1, max_length=200)
    round: str = Field(..., min_length=1, max_length=50)
    group: Optional[str] = Field(None, max_length=50)
    team_a_logo: Optional[str] = None
    team_b_logo: Optional[str] = None

    @model_validator(mode="after")
    def validate_teams(self) -> "MatchCreate":
        """Ensure both teams are either registered (IDs) or manual (names)"""
        has_a_id = self.team_a_id is not None
        has_a_name = self.team_a_name is not None
        has_b_id = self.team_b_id is not None
        has_b_name = self.team_b_name is not None
        
        # Check for mixed usage (both ID and name)
        if (has_a_id and has_a_name) or (has_b_id and has_b_name):
            raise ValueError("Cannot specify both ID and name for a team")
        
        # Both teams must be provided
        if not ((has_a_id or has_a_name) and (has_b_id or has_b_name)):
            raise ValueError("Both teams must be specified (either as IDs or names)")
        
        return self


class MatchUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    venue: Optional[str] = Field(None, min_length=1, max_length=200)
    round: Optional[str] = Field(None, min_length=1, max_length=50)
    group: Optional[str] = None
    team_a_logo: Optional[str] = None
    team_b_logo: Optional[str] = None


class ScoreUpdate(BaseModel):
    team_a_score: Optional[int] = Field(None, ge=0)
    team_b_score: Optional[int] = Field(None, ge=0)
    status: Optional[MatchStatus] = None


class MatchResponse(BaseModel):
    id: uuid.UUID
    team_a_id: Optional[uuid.UUID]
    team_b_id: Optional[uuid.UUID]
    team_a_name: str
    team_b_name: str
    team_a_score: Optional[int]
    team_b_score: Optional[int]
    team_a_logo: Optional[str] = None
    team_b_logo: Optional[str] = None
    status: str
    round: str
    group: Optional[str]
    scheduled_at: datetime
    venue: str
    bracket_slot: Optional[int] = None
    next_match_id: Optional[uuid.UUID] = None
    match_start_time: Optional[datetime] = None
    match_end_time: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, exclude_none=False)
