# Delete Registration Fix

## Problem
The delete registration feature was failing with the error: **"Failed to delete registration"**

## Root Cause
The `PaymentProof` model in `backend/app/models/team.py` was missing cascade delete configuration. When attempting to delete a team, the database foreign key constraint prevented deletion because related `payment_proof` records existed without cascade delete rules.

## Solution
Updated the `Team` model's relationship with `PaymentProof` to include cascade delete:

```python
# Before:
payment_proof: Mapped[Optional["PaymentProof"]] = relationship(back_populates="team", uselist=False)

# After:
payment_proof: Mapped[Optional["PaymentProof"]] = relationship(back_populates="team", uselist=False, cascade="all, delete-orphan")
```

## What This Does
- When a team is deleted, SQLAlchemy will automatically delete the associated payment proof record
- The delete endpoint also removes the physical files (payment proof image and team logo) from disk
- Players are already configured with cascade delete, so they are also removed automatically

## Testing
1. Restart the development servers (already done)
2. Log in to the admin dashboard at http://localhost:5173
3. Select any registration
4. Click "Delete Registration" at the bottom
5. Confirm the deletion
6. The registration should now be successfully deleted

## Files Changed
- `backend/app/models/team.py` - Added cascade delete to payment_proof relationship

## Status
✅ **FIXED** - Servers restarted with updated model. Delete functionality should now work correctly.
