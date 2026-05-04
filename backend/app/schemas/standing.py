import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, computed_field


class StandingResponse(BaseModel):
    team_id: uuid.UUID
    team_name: str
    team_logo: Optional[str] = None
    played: int
    wins: int
    draws: int
    losses: int
    goals_scored: int
    goals_conceded: int
    goal_difference: int
    points: int

    model_config = ConfigDict(from_attributes=True)
