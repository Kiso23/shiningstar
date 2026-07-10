from typing import List
import asyncio
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, desc

from app.dependencies.db import get_db
from app.models.team import Team
from app.schemas.player import PlayerCreate
from app.schemas.team import TeamCreate, TeamResponse
from app.services import registration_service, payment_service
from app.services.razorpay_service import RazorpayService
from app.services.email_service import send_registration_confirmation

router = APIRouter(prefix="/registrations", tags=["registrations"])
razorpay_service = RazorpayService()


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
    # Validate registration_id format (SSU-YYYYMMDD-XXXXXX = 19 chars)
    if not registration_id.startswith("SSU-") or len(registration_id) != 19:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid registration ID format. Expected format: SSU-YYYYMMDD-XXXXXX (got: {registration_id}, length: {len(registration_id)})"
        )
    
    team = await registration_service.get_team_by_registration_id(db, registration_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    # Allow 11 required players + up to 7 optional players (total 11-18)
    min_players = 11
    max_players = 18
    if len(players) < min_players or len(players) > max_players:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Expected {min_players}-{max_players} players, got {len(players)}",
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
    # Validate registration_id format (SSU-YYYYMMDD-XXXXXX = 19 chars)
    if not registration_id.startswith("SSU-") or len(registration_id) != 19:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid registration ID format. Expected format: SSU-YYYYMMDD-XXXXXX (got: {registration_id}, length: {len(registration_id)})"
        )
    
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


@router.get("/resume/by-email")
async def get_pending_registration_by_email(
    email: str,
    db: AsyncSession = Depends(get_db),
):
    """Get pending registration by email to resume from where user left off."""
    # Query for pending or payment_submitted registration
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.players))
        .where(Team.contact_email == email)
        .where(Team.status.in_(["pending", "payment_submitted"]))
        .order_by(desc(Team.created_at))
    )
    team = result.scalar_one_or_none()

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending registration found for this email"
        )

    # Determine which step user is on based on what data exists
    step = 1  # Default to step 1
    if team.players:
        step = 3 if team.payment_proof or team.razorpay_payment else 2
    
    return {
        "registration_id": team.registration_id,
        "status": team.status,
        "current_step": step,
        "team_data": {
            "team_name": team.team_name,
            "manager_name": team.manager_name,
            "contact_phone": team.contact_phone,
            "contact_email": team.contact_email,
            "player_count": team.player_count,
            "address": team.address or "",
        },
        "players": [
            {
                "full_name": p.full_name,
                "age": p.age,
                "jersey_number": p.jersey_number,
                "position": p.position,
            }
            for p in sorted(team.players, key=lambda x: x.position_index)
        ] if team.players else [],
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


@router.post("/{registration_id}/razorpay-order", status_code=status.HTTP_201_CREATED)
async def create_razorpay_order(
    registration_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Create a Razorpay order for payment."""
    team = await registration_service.get_team_by_registration_id(db, registration_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    try:
        order = await razorpay_service.create_order(db, str(team.id))
        return order
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{registration_id}/verify-payment", status_code=status.HTTP_200_OK)
async def verify_razorpay_payment(
    registration_id: str,
    payment_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Verify Razorpay payment signature."""
    team = await registration_service.get_team_by_registration_id(db, registration_id)
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    try:
        is_valid = await razorpay_service.verify_payment(
            db,
            str(team.id),
            payment_data.get("razorpay_order_id"),
            payment_data.get("razorpay_payment_id"),
            payment_data.get("razorpay_signature"),
        )

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed",
            )

        return {
            "message": "Payment verified successfully",
            "status": "payment_verified",
            "registration_id": registration_id,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
