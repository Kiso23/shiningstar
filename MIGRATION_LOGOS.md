# Database Migration: Add Club Logos Support

## What Changed
Added `team_a_logo` and `team_b_logo` columns to the `matches` table to store club flags/logos.

## How to Run Migration

### Option 1: Using SQL File (Recommended for Production)
```bash
# PostgreSQL
psql -U postgres -d your_database_name -f MIGRATION_SQL.sql

# Or if you have connection string
psql "postgresql://user:password@localhost/database" -f MIGRATION_SQL.sql
```

### Option 2: Using psql interactive
```bash
psql -U postgres -d your_database_name

# Then run:
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_logo TEXT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_logo TEXT NULL;
```

### Option 3: Automatic (on app startup)
The app uses SQLAlchemy's `create_all()` which should auto-create the columns when the app starts if using a fresh database.

### Option 4: Manual Python Migration (requires environment setup)
```bash
# Set up environment variables first
export DATABASE_URL="postgresql://user:password@localhost/database"
export SECRET_KEY="your-secret-key"

cd backend
python -m scripts.migrate_add_logos
```

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
```sql
ALTER TABLE matches DROP COLUMN IF EXISTS team_a_logo;
ALTER TABLE matches DROP COLUMN IF EXISTS team_b_logo;
```

## Verify Migration Success
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name IN ('team_a_logo', 'team_b_logo')
ORDER BY column_name;
```

Should return 2 rows with `team_a_logo` and `team_b_logo`.

## API Changes
- **POST /matches**: Now accepts `team_a_logo` and `team_b_logo`
- **PATCH /matches/{id}**: Now accepts `team_a_logo` and `team_b_logo`
- **GET /matches**: Response includes logo fields
- **GET /matches/{id}**: Response includes logo fields

## Status
✅ Backend: Ready
✅ Frontend: Ready
✅ Database: Ready (run migration above)
