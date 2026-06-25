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
    team_a_id: uuid.UUID
    team_b_id: uuid.UUID
    scheduled_at: datetime
    venue: str = Field(..., min_length=1, max_length=200)
    round: str = Field(..., min_length=1, max_length=50)
    group: Optional[str] = Field(None, max_length=50)
    team_a_logo: Optional[str] = None
    team_b_logo: Optional[str] = None

    @model_validator(mode="after")
    def teams_must_differ(self) -> "MatchCreate":
        if self.team_a_id == self.team_b_id:
            raise ValueError("Team A and Team B must be different teams")
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

    model_config = ConfigDict(from_attributes=True)
