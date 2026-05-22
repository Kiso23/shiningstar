from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
import os
import uuid

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_admin
from app.models.admin import Admin
from app.models.player_recruitment import PlayerRecruitment
from app.schemas.player_recruitment import (
    PlayerRecruitmentCreate,
    PlayerRecruitmentResponse,
    PlayerRecruitmentUpdate,
    PlayerRecruitmentList,
)
from app.services import player_recruitment_service
from app.services.email_service import send_player_recruitment_notification, send_player_recruitment_status_update
from app.config import settings

router = APIRouter(prefix="/player-recruitment", tags=["player-recruitment"])


@router.post("", response_model=PlayerRecruitmentResponse, status_code=status.HTTP_201_CREATED)
async def create_player_recruitment(
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    age: int = Form(...),
    date_of_birth: str | None = Form(None),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    postal_code: str | None = Form(None),
    position: str = Form(...),
    jersey_number: int | None = Form(None),
    height: float | None = Form(None),
    weight: float | None = Form(None),
    years_of_experience: int = Form(...),
    previous_clubs: str | None = Form(None),
    achievements: str | None = Form(None),
    preferred_foot: str | None = Form(None),
    injuries_or_concerns: str | None = Form(None),
    additional_notes: str | None = Form(None),
    photo: UploadFile | None = File(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db),
):
    """Create a new player recruitment application (public endpoint)."""
    photo_url = None
    
    # Handle photo upload
    if photo:
        try:
            # Create uploads directory if it doesn't exist
            upload_dir = os.path.join(settings.UPLOAD_DIR, "player_photos")
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            file_ext = os.path.splitext(photo.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Save file
            contents = await photo.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            
            # Store relative URL
            photo_url = f"/uploads/player_photos/{unique_filename}"
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to upload photo: {str(e)}"
            )
    
    try:
        # Create PlayerRecruitmentCreate object from form data
        data = PlayerRecruitmentCreate(
            full_name=full_name,
            email=email,
            phone=phone,
            age=age,
            date_of_birth=date_of_birth,
            address=address,
            city=city,
            state=state,
            postal_code=postal_code,
            position=position,
            jersey_number=jersey_number,
            height=height,
            weight=weight,
            years_of_experience=years_of_experience,
            previous_clubs=previous_clubs,
            achievements=achievements,
            preferred_foot=preferred_foot,
            injuries_or_concerns=injuries_or_concerns,
            additional_notes=additional_notes,
        )
        
        # Create player recruitment record
        player = await player_recruitment_service.create_player_recruitment(
            db, data, photo_url
        )
        
        # Send notification email to admin in background
        background_tasks.add_task(
            send_player_recruitment_notification,
            player_name=player.full_name,
            player_email=player.email,
            player_phone=player.phone,
            position=player.position.value,
            age=player.age,
            experience=player.years_of_experience,
        )
        
        return player
    except Exception as e:
        # Log the error and return a user-friendly message
        import logging
        logging.getLogger(__name__).error(f"Failed to create player recruitment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit application. Please try again later."
        )


@router.get("/admin/applications", response_model=list[PlayerRecruitmentList])
async def list_player_recruitments(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = None,
    position_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """List all player recruitment applications (admin only)."""
    players = await player_recruitment_service.list_player_recruitments(
        db, skip, limit, status_filter, position_filter
    )
    return players


@router.get("/admin/applications/{player_id}", response_model=PlayerRecruitmentResponse)
async def get_player_recruitment(
    player_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Get a specific player recruitment application (admin only)."""
    player = await player_recruitment_service.get_player_recruitment_by_id(db, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player recruitment application not found"
        )
    return player


@router.patch("/admin/applications/{player_id}", response_model=PlayerRecruitmentResponse)
async def update_player_recruitment_status(
    player_id: str,
    update_data: PlayerRecruitmentUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Update player recruitment status (admin only)."""
    player = await player_recruitment_service.update_player_recruitment_status(
        db, player_id, update_data
    )
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player recruitment application not found"
        )
    
    # Send status update email in background
    background_tasks.add_task(
        send_player_recruitment_status_update,
        to_email=player.email,
        player_name=player.full_name,
        position=player.position.value,
        status=update_data.status.value,
    )
    
    return player


@router.delete("/admin/applications/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_player_recruitment(
    player_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Delete a player recruitment application (admin only)."""
    success = await player_recruitment_service.delete_player_recruitment(db, player_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player recruitment application not found"
        )
    return None


@router.get("/admin/applications-count")
async def get_player_recruitments_count(
    status_filter: str | None = None,
    position_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Get count of player recruitment applications (admin only)."""
    count = await player_recruitment_service.get_player_recruitments_count(
        db, status_filter, position_filter
    )
    return {"count": count}
