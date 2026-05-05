import csv
import io
import math
import os
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import openpyxl

from app.dependencies.auth import get_current_admin
from app.dependencies.db import get_db
from app.models.admin import Admin
from app.models.player import Player
from app.models.team import Team
from app.schemas.admin import ExportFormat, PaginatedTeamList, StatusUpdateRequest
from app.schemas.common import RegistrationStatus
from app.schemas.team import TeamDetailResponse, TeamResponse
from app.services.registration_service import update_team_status
from app.services.email_service import send_status_update

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/registrations", response_model=PaginatedTeamList)
async def list_registrations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[RegistrationStatus] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """List all registrations with pagination, filtering, and search."""
    query = select(Team)

    if status_filter:
        query = query.where(Team.status == status_filter.value)

    if search:
        search_term = f"%{search.lower()}%"
        query = query.where(
            or_(
                func.lower(Team.team_name).like(search_term),
                func.lower(Team.manager_name).like(search_term),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(Team.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    teams = result.scalars().all()

    return PaginatedTeamList(
        items=[TeamResponse.model_validate(t) for t in teams],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get("/registrations/{registration_id}", response_model=TeamDetailResponse)
async def get_registration_detail(
    registration_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Get full team details including players and payment proof."""
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.players), selectinload(Team.payment_proof))
        .where(Team.registration_id == registration_id)
    )
    team = result.scalar_one_or_none()
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")
    return TeamDetailResponse.model_validate(team)


@router.patch("/registrations/{registration_id}/status", response_model=TeamResponse)
async def update_registration_status(
    registration_id: str,
    body: StatusUpdateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Approve or reject a team registration."""
    result = await db.execute(select(Team).where(Team.registration_id == registration_id))
    team = result.scalar_one_or_none()
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    updated_team = await update_team_status(db, team.id, body.status)

    # Send status update email in background — load players for PDF attachment
    if body.status.value in ("approved", "rejected"):
        # Reload with players for PDF generation
        team_with_players = await db.execute(
            select(Team)
            .options(selectinload(Team.players))
            .where(Team.id == updated_team.id)
        )
        full_team = team_with_players.scalar_one_or_none()
        players_data = []
        if full_team and full_team.players:
            players_data = [
                {
                    "full_name": p.full_name,
                    "age": p.age,
                    "jersey_number": p.jersey_number,
                    "position": p.position,
                    "position_index": p.position_index,
                }
                for p in full_team.players
            ]

        background_tasks.add_task(
            send_status_update,
            to_email=updated_team.contact_email,
            team_name=updated_team.team_name,
            manager_name=updated_team.manager_name,
            registration_id=updated_team.registration_id,
            new_status=body.status.value,
            players=players_data,
            player_count=updated_team.player_count,
            contact_phone=updated_team.contact_phone,
            contact_email=updated_team.contact_email,
            created_at=updated_team.created_at,
        )

    return TeamResponse.model_validate(updated_team)


@router.get("/registrations/{registration_id}/payment-proof")
async def get_payment_proof(
    registration_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Serve the payment proof image for inline viewing."""
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.payment_proof))
        .where(Team.registration_id == registration_id)
    )
    team = result.scalar_one_or_none()
    if team is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")
    if team.payment_proof is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No payment proof uploaded")

    file_path = team.payment_proof.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment proof file not found")

    return FileResponse(
        path=file_path,
        media_type=team.payment_proof.mime_type,
        filename=team.payment_proof.original_filename,
    )


@router.get("/export")
async def export_registrations(
    format: ExportFormat = Query(ExportFormat.csv),
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Export all registrations as CSV or XLSX."""
    # Fetch all teams with players
    result = await db.execute(
        select(Team).options(selectinload(Team.players)).order_by(Team.created_at)
    )
    teams = result.scalars().all()

    team_headers = [
        "registration_id", "team_name", "manager_name", "contact_phone",
        "contact_email", "player_count", "status", "created_at",
    ]
    player_headers = ["registration_id", "player_full_name", "player_age"]

    if format == ExportFormat.csv:
        output = io.StringIO()
        writer = csv.writer(output)

        # Teams sheet
        writer.writerow(["--- TEAMS ---"])
        writer.writerow(team_headers)
        for team in teams:
            writer.writerow([
                team.registration_id, team.team_name, team.manager_name,
                team.contact_phone, team.contact_email, team.player_count,
                team.status, team.created_at.isoformat(),
            ])

        writer.writerow([])
        writer.writerow(["--- PLAYERS ---"])
        writer.writerow(player_headers)
        for team in teams:
            for player in team.players:
                writer.writerow([team.registration_id, player.full_name, player.age])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=registrations.csv"},
        )

    else:  # xlsx
        wb = openpyxl.Workbook()

        # Teams sheet
        ws_teams = wb.active
        ws_teams.title = "Teams"
        ws_teams.append(team_headers)
        for team in teams:
            ws_teams.append([
                team.registration_id, team.team_name, team.manager_name,
                team.contact_phone, team.contact_email, team.player_count,
                team.status, team.created_at.isoformat(),
            ])

        # Players sheet
        ws_players = wb.create_sheet("Players")
        ws_players.append(player_headers)
        for team in teams:
            for player in team.players:
                ws_players.append([team.registration_id, player.full_name, player.age])

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=registrations.xlsx"},
        )


@router.delete("/registrations/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_registration(
    registration_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    """Delete a team registration and all associated data."""
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.players), selectinload(Team.payment_proof))
        .where(Team.registration_id == registration_id)
    )
    team = result.scalar_one_or_none()
    
    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Delete payment proof file if exists
    if team.payment_proof and os.path.exists(team.payment_proof.file_path):
        try:
            os.remove(team.payment_proof.file_path)
        except OSError:
            pass  # File already deleted or inaccessible
    
    # Delete team logo file if exists
    if team.logo_path and os.path.exists(team.logo_path):
        try:
            os.remove(team.logo_path)
        except OSError:
            pass
    
    # Delete team (cascade will delete players and payment_proof)
    await db.delete(team)
    await db.commit()
    
    return None
