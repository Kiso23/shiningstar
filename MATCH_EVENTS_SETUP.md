# Match Events Feature - Setup Guide

## Overview
This adds a **Match Events system** that tracks player actions during matches:
- ⚽ Goals (with player name and time)
- 🟨 Yellow Cards (with player name and time)
- 🔴 Red Cards (with player name and time)
- 🔄 Substitutions (with replaced player)
- ⚡ Own Goals

## What Was Added

### Backend
- `app/models/match_event.py` - MatchEvent ORM model
- `app/schemas/match_event.py` - Pydantic schemas for API
- `app/routers/match_events.py` - API endpoints
- Updated `app/main.py` - Registered router and model

### Frontend
- `src/api/matchEvents.ts` - API client
- `src/components/shared/MatchEventsTimeline.tsx` - Event timeline display
- `src/components/admin/MatchEventForm.tsx` - Admin form to add events
- Updated `src/pages/LivePage.tsx` - Display events in live scores
- Updated `src/components/admin/LiveScoresTab.tsx` - Admin event management

## Database Migration

### Step 1: Add match_events Table (Neon Console)

Go to **Neon Console** → **SQL Editor** and run:

```sql
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL,
    team VARCHAR(10) NOT NULL CHECK (team IN ('team_a', 'team_b')),
    player_name VARCHAR(100) NOT NULL,
    time_minute INTEGER NOT NULL CHECK (time_minute >= 0 AND time_minute <= 200),
    player_replaced VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_event_type ON match_events(event_type);
CREATE INDEX IF NOT EXISTS idx_match_events_time_minute ON match_events(time_minute);
```

### Step 2: Verify Table Was Created

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_events'
ORDER BY ordinal_position;
```

You should see columns like: `id`, `match_id`, `event_type`, `team`, `player_name`, `time_minute`, `player_replaced`, `notes`, `created_at`, `updated_at`.

### Step 3: Restart Backend

After running the SQL:
1. Go to **Render Dashboard** → Your backend service
2. Click **Manual Deploy** or restart the service
3. Wait for deployment to complete

## API Endpoints

### Get Match Events (Public)
```
GET /api/v1/matches/{match_id}/events
Response:
{
  "match_id": "uuid",
  "events": [ ... ],
  "total_goals_team_a": 2,
  "total_goals_team_b": 1,
  "total_yellow_cards_team_a": 1,
  "total_yellow_cards_team_b": 2,
  "total_red_cards_team_a": 0,
  "total_red_cards_team_b": 0
}
```

### Create Match Event (Admin Only)
```
POST /api/v1/matches/{match_id}/events
Body:
{
  "event_type": "goal",
  "team": "team_a",
  "player_name": "John Doe",
  "time_minute": 45,
  "player_replaced": null,
  "notes": "Free kick"
}
```

### Update Match Event (Admin Only)
```
PATCH /api/v1/matches/{match_id}/events/{event_id}
```

### Delete Match Event (Admin Only)
```
DELETE /api/v1/matches/{match_id}/events/{event_id}
```

## How to Use

### For Admin Dashboard
1. Go to **Admin Dashboard** → **Live Scores**
2. Find a live match
3. Click **Add Event** button
4. Fill in:
   - Event Type (Goal, Yellow Card, Red Card, Substitution, Own Goal)
   - Team (Team A or Team B)
   - Player Name
   - Time in Minutes
   - Optional: Player Replaced (for substitutions)
   - Optional: Notes
5. Click **Create Event**

### For Viewers
1. Go to **Live Scores** page
2. Live match will show a **Match Events** section below the score
3. All recorded events appear in a timeline with:
   - Event type and icon
   - Player name
   - Team name
   - Time in minutes

## Event Types

| Event | Icon | Description |
|-------|------|-------------|
| **Goal** | ⚽ | Player scored a goal |
| **Own Goal** | ⚡ | Player scored against their own team |
| **Yellow Card** | 🟨 | Player received yellow card (warning) |
| **Red Card** | 🔴 | Player received red card (sent off) |
| **Substitution** | 🔄 | Player substituted (on or off) |

## Features

✅ Real-time event tracking
✅ Timeline view sorted by time
✅ Event statistics (total goals, cards, etc.)
✅ Admin panel to manage events
✅ Public API to fetch events
✅ Responsive design
✅ Smooth animations
✅ Auto-refresh on live pages

## Rollback (if needed)

If you need to remove this feature:

**Drop the table (Neon Console):**
```sql
DROP TABLE IF EXISTS match_events;
```

**Then remove backend/frontend code:**
- Delete `app/models/match_event.py`
- Delete `app/schemas/match_event.py`
- Delete `app/routers/match_events.py`
- Remove `MatchEventForm` from `LiveScoresTab.tsx`
- Remove events display from `LivePage.tsx`

## Testing

1. **Create a match** and set status to "live"
2. **Add events** via admin dashboard
3. **View live page** - events should appear
4. **Check API** - `GET /api/v1/matches/{match_id}/events`
5. **Verify stats** - goal count, card counts should be correct

## Troubleshooting

**Events not appearing:**
- Check backend was restarted after migration
- Verify table exists in Neon: `SELECT * FROM match_events LIMIT 1;`
- Check browser console for API errors

**"No events recorded yet":**
- Add events using the admin form
- Make sure match status is "live"

**API returns 404:**
- Check match ID exists
- Verify backend router is registered (check main.py imports)

## Next Steps

Once this is working, you can:
- Add **player statistics** (goals, assists, cards per player)
- Add **match highlights** (upload video clips for goals)
- Add **post-match analysis** and commentary
- Track **historical stats** across all matches
