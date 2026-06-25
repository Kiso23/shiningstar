# Database Migration: Add Club Logos Support

## What Changed
Added `team_a_logo` and `team_b_logo` columns to the `matches` table to store club flags/logos.

## How to Run Migration

### Option 1: Automatic (on app startup)
The app uses SQLAlchemy's `create_all()` which should auto-create the columns when the app starts.

### Option 2: Manual Migration Script
```bash
cd backend
python -m scripts.migrate_add_logos
```

This script will:
- Check if columns already exist
- Add `team_a_logo` column if missing
- Add `team_b_logo` column if missing
- Commit changes safely

## What These Columns Store
- **team_a_logo**: URL or data URL (base64) of Team A's club flag/logo
- **team_b_logo**: URL or data URL (base64) of Team B's club flag/logo

Both are optional (nullable TEXT columns).

## How to Use
1. **Upload logos in Admin Dashboard**
   - Go to Fixtures tab
   - Create or edit a fixture
   - Upload club flag images for both teams
   - Logos are saved as base64 data URLs

2. **Logos appear on**
   - Fixtures page (/fixtures)
   - Live Scores page (/live)
   - API responses include `team_a_logo` and `team_b_logo`

## Rollback (if needed)
If you need to remove these columns:
```sql
ALTER TABLE matches DROP COLUMN team_a_logo;
ALTER TABLE matches DROP COLUMN team_b_logo;
```

## API Changes
- **POST /matches**: Now accepts `team_a_logo` and `team_b_logo`
- **PATCH /matches/{id}**: Now accepts `team_a_logo` and `team_b_logo`
- **GET /matches**: Response includes logo fields
- **GET /matches/{id}**: Response includes logo fields

## Status
✅ Backend: Ready
✅ Frontend: Ready
✅ Database: Run migration script
