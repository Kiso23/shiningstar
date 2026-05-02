from typing import List
import asyncio
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.dependencies.db import get_db
from app.models.team import Team
from app.schemas.player import PlayerCreate
from app.schemas.team import TeamCreate, TeamResponse
from app.services import registration_service, payment_service
from app.services.email_service import send_registration_confirmation

router = APIRouter(prefix="/registrations", tags=["registrations"])


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_registration(
    data: TeamCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Step 1: Create a new team registration."""
    team = await registration_service.create_team(db, data)

    # Send confirmation email in background (never blocks or fails the request)
    background_tasks.add_task(
        send_registration_confirmation,
        to_email=team.contact_email,
        team_name=team.team_name,
        manager_name=team.manager_name,
        registration_id=team.registration_id,
        player_count=team.player_count,
    )

    return team


@router.post("/{registration_id}/players", status_code=status.HTTP_201_CREATED)
async def submit_players(
    registration_id: str,
    players: List[PlayerCreate],
    db: AsyncSession = Depends(get_db),
):
    """Step 2: Submit player roster for a registration."""
    team = await registration_service.get_team_by_registration_id(db, registration_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    if len(players) != team.player_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Expected {team.player_count} players, got {len(players)}",
        )

    await registration_service.create_players(db, team.id, players)
    return {"message": "Players submitted successfully", "count": len(players)}


@router.post("/{registration_id}/payment", status_code=status.HTTP_200_OK)
async def upload_payment(
    registration_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Step 3: Upload payment proof screenshot."""
    # Load team with payment_proof relationship eagerly
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.payment_proof))
        .where(Team.registration_id == registration_id)
    )
    team = result.scalar_one_or_none()

    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    # Delegate all validation + storage to the payment service
    await payment_service.store_payment_proof(db, team, file)

    return {
        "message": "Payment proof uploaded successfully",
        "status": "payment_submitted",
        "registration_id": registration_id,
    }


@router.get("/{registration_id}/status")
async def get_registration_status(
    registration_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the current status of a registration."""
    team = await registration_service.get_team_by_registration_id(db, registration_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    return {
        "registration_id": team.registration_id,
        "status": team.status,
        "team_name": team.team_name,
    }
