import os
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.payment_proof import PaymentProof
from app.models.team import Team
from app.schemas.common import RegistrationStatus
from app.utils.file_storage import save_file, delete_file


def validate_file(mime_type: str, size_bytes: int, max_bytes: int) -> None:
    """Validate file MIME type and size. Raises 400 or 413 on failure."""
    if mime_type not in settings.ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{mime_type}'. Only JPEG and PNG are accepted.",
        )
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size {size_bytes} bytes exceeds the maximum allowed {max_bytes} bytes.",
        )


def validate_logo(mime_type: str, size_bytes: int) -> None:
    """Validate a team logo file."""
    validate_file(mime_type, size_bytes, settings.MAX_LOGO_SIZE_BYTES)


async def store_payment_proof(
    db: AsyncSession, team: Team, file: UploadFile
) -> PaymentProof:
    """
    Validate, store, and record a payment proof file.
    Follows write-then-update pattern: deletes file on DB failure.
    Provides specific error messages for different failure types.
    """
    file_bytes = await file.read()
    mime_type = file.content_type or "application/octet-stream"

    # Validate file size early (before any encoding that could fail)
    if len(file_bytes) > settings.MAX_PAYMENT_PROOF_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_PAYMENT_PROOF_SIZE_BYTES} bytes. Please upload a smaller image.",
        )

    # Validate MIME type
    if mime_type not in settings.ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{mime_type}'. Only JPEG and PNG images are accepted.",
        )

    # Check if payment proof already exists
    if team.payment_proof is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment proof already submitted for this registration. Contact support to update it.",
        )

    dest_dir = os.path.join(settings.UPLOAD_DIR, "payment_proofs")
    file_path = None

    try:
        # Step 1: Write file to filesystem
        try:
            file_path = save_file(dest_dir, str(team.id), file_bytes, file.filename or "proof.jpg")
        except OSError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save payment proof file. Please try again later.",
            )

        # Step 2: Insert PaymentProof record
        try:
            proof = PaymentProof(
                team_id=team.id,
                file_path=file_path,
                original_filename=file.filename or "proof.jpg",
                mime_type=mime_type,
                file_size_bytes=len(file_bytes),
            )
            db.add(proof)
            await db.flush()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to record payment proof in database. Please try again.",
            )

        # Step 3: Update team status
        try:
            team.status = RegistrationStatus.payment_submitted.value
            await db.flush()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update registration status. Please try again.",
            )
        
        # Step 4: Commit transaction to persist changes
        try:
            await db.commit()
            await db.refresh(proof)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to finalize payment submission. Please try again.",
            )
        return proof

    except HTTPException:
        # Clean up file if DB operations failed
        if file_path:
            delete_file(file_path)
        await db.rollback()
        raise
    except Exception as e:
        if file_path:
            delete_file(file_path)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while processing your payment proof. Please try again.",
        )
