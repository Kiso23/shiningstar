from enum import Enum
from typing import List
from pydantic import BaseModel
from app.schemas.common import RegistrationStatus
from app.schemas.team import TeamResponse


class ExportFormat(str, Enum):
    csv = "csv"
    xlsx = "xlsx"


class StatusUpdateRequest(BaseModel):
    status: RegistrationStatus


class PaginatedTeamList(BaseModel):
    items: List[TeamResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
