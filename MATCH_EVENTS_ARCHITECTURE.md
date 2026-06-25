# Match Events System - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MATCH EVENTS SYSTEM                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                           PUBLIC VIEWERS                             │
│                        (Live Scores Page)                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Live Score Display                                           │  │
│  │ ┌─────────────────┐           ┌─────────────────┐           │  │
│  │ │  SSU            │           │  ECO            │           │  │
│  │ │  [Flag Image]   │    2 - 1  │  [Flag Image]   │           │  │
│  │ └─────────────────┘           └─────────────────┘           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Match Events Timeline (Auto-refresh every 30s)               │  │
│  │ ┌──────────────────────────────────────────────────────────┐ │  │
│  │ │ ⚽ John Doe (SSU)              35'   Goal        │ │  │
│  │ │ 🟨 Mike Smith (ECO)           42'   Yellow Card  │ │  │
│  │ │ ⚽ Sarah Khan (SSU)            67'   Goal        │ │  │
│  │ │ 🔴 Tom Brady (ECO)            80'   Red Card    │ │  │
│  │ └──────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                    ▲                                 │
│                                    │ GET /matches/{id}/events       │
│                                    │                                 │
└────────────────────────────────────┼─────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
        ┌───────────────────────┐         ┌───────────────────────┐
        │   FRONTEND (React)    │         │  BACKEND (FastAPI)    │
        ├───────────────────────┤         ├───────────────────────┤
        │ LivePage.tsx          │         │ /api/v1/matches/...   │
        │ ▲                     │         │ /events               │
        │ │                     │         │                       │
        │ └─ Fetch events       │◄────────┤ GET, POST, PATCH      │
        │ every 30 seconds      │         │ DELETE                │
        │                       │         │                       │
        │ MatchEventsTimeline   │         └───────────────────────┘
        │ .tsx                  │                  │
        │                       │                  │ Queries/Updates
        │ Displays timeline     │                  │
        │ with smooth           │                  │
        │ animations            │                  │
        └───────────────────────┘                  │
                    ▲                              │
                    │                              ▼
                    │          ┌──────────────────────────────┐
                    │          │   ADMIN DASHBOARD (React)    │
                    │          ├──────────────────────────────┤
                    │          │ LiveScoresTab.tsx            │
                    │          │                              │
                    │          │ ┌────────────────────────┐   │
                    │          │ │  [Add Event] Button    │   │
                    │          │ └────────┬───────────────┘   │
                    │          │          │                   │
                    │          │          ▼                   │
                    │          │ ┌──────────────────────┐    │
                    │          │ │ MatchEventForm.tsx   │    │
                    │          │ │                      │    │
                    │          │ │ Event Type: [Goal ▼] │    │
                    │          │ │ Team: [SSU ▼]        │    │
                    │          │ │ Player: [______]      │    │
                    │          │ │ Time: [___]          │    │
                    │          │ │                      │    │
                    │          │ │ [Create Event]       │    │
                    │          │ └────────┬─────────────┘    │
                    │          │          │                  │
                    │          └──────────┼──────────────────┘
                    │                     │
                    │    POST /matches/{id}/events
                    │    {event_type, team, player_name, time_minute}
                    │                     │
                    │                     ▼
                    │    ┌────────────────────────────┐
                    │    │   BACKEND HANDLER          │
                    │    ├────────────────────────────┤
                    │    │ Validate input             │
                    │    │ Check auth (admin only)    │
                    │    │ Create MatchEvent          │
                    │    │ Save to database           │
                    │    │ Return created event       │
                    │    └────────────────┬───────────┘
                    │                     │
                    │                     ▼
                    │    ┌────────────────────────────┐
                    │    │   NEON DATABASE            │
                    │    ├────────────────────────────┤
                    │    │ match_events TABLE         │
                    │    │                            │
                    │    │ Columns:                   │
                    │    │ - id (UUID)                │
                    │    │ - match_id (FK)            │
                    │    │ - event_type               │
                    │    │ - team                     │
                    │    │ - player_name              │
                    │    │ - time_minute              │
                    │    │ - player_replaced          │
                    │    │ - notes                    │
                    │    │ - created_at               │
                    │    │ - updated_at               │
                    │    │                            │
                    │    │ Indexes:                   │
                    │    │ - match_id (fast lookup)   │
                    │    │ - event_type (fast filter) │
                    │    └────────────────────────────┘
                    │                     │
                    │                     │ Event created! ✅
                    │                     │
                    │    ┌────────────────┴──────────────┐
                    │    │ Return 201 Created            │
                    │    │ {event_id, timestamp, ...}    │
                    │    └────────────────┬──────────────┘
                    │                     │
                    └─────────────────────┴──────────────────
                          LivePage polls every 30 seconds
                          for new events
```

## Data Flow

### Adding an Event (Admin)

```
Admin fills form in MatchEventForm.tsx
         │
         ▼
Form validation (Zod)
         │
         ▼
POST /api/v1/matches/{id}/events
         │
         ▼
Backend validates (Pydantic)
         │
         ▼
Verify admin authenticated
         │
         ▼
Verify match exists
         │
         ▼
Create MatchEvent in database
         │
         ▼
Return 201 Created + event data
         │
         ▼
Form shows success message ✅
         │
         ▼
Refresh events list
         │
         ▼
Timeline updates in modal
```

### Viewing Events (Public)

```
User opens Live Scores page (LivePage.tsx)
         │
         ▼
Component mounts
         │
         ▼
Fetch live matches (with logos)
         │
         ▼
For each match: GET /api/v1/matches/{id}/events
         │
         ▼
Backend queries database
         │
         ▼
Return events + statistics
         │
         ▼
MatchEventsTimeline component renders
         │
         ▼
Events display as timeline with icons
         │
         ▼
Set refresh interval (30 seconds)
         │
         ▼
Every 30 seconds: repeat fetch
         │
         ▼
New events automatically appear ✅
```

## Component Architecture

### Frontend Components

```
LivePage.tsx (Public)
├── Header (Live badge, refresh button)
├── Match Display (Teams, score, logos)
└── MatchEventsTimeline
    ├── Event Item (for each event)
    │   ├── Event Icon
    │   ├── Player Name
    │   ├── Team Name
    │   ├── Time Minute
    │   └── Event Type Label
    └── Animation wrapper

Admin - LiveScoresTab.tsx
├── Header (Live, Scheduled, Completed)
├── Match Cards (groups by status)
│   ├── Match Info
│   ├── ScoreUpdateForm
│   └── MatchEventForm (only for LIVE)
│       ├── Modal
│       ├── Existing Events List
│       │   └── MatchEventsTimeline
│       └── New Event Form
│           ├── Event Type Select
│           ├── Team Select
│           ├── Player Name Input
│           ├── Time Input
│           ├── Notes Input
│           └── Submit Button
```

## API Endpoints Architecture

```
/api/v1/matches/{match_id}/events

├── GET (Public - Read events)
│   ├── Query: None
│   ├── Auth: None required
│   ├── Response: 
│   │   ├── events: [...]
│   │   ├── total_goals_team_a
│   │   ├── total_goals_team_b
│   │   ├── total_yellow_cards_team_a
│   │   ├── total_yellow_cards_team_b
│   │   ├── total_red_cards_team_a
│   │   └── total_red_cards_team_b
│   └── Status: 200
│
├── POST (Admin only - Create event)
│   ├── Auth: Admin token required
│   ├── Body:
│   │   ├── event_type: "goal" | "yellow_card" | "red_card" | "substitution" | "own_goal"
│   │   ├── team: "team_a" | "team_b"
│   │   ├── player_name: string
│   │   ├── time_minute: int (0-200)
│   │   ├── player_replaced?: string
│   │   └── notes?: string
│   ├── Response: MatchEventResponse
│   └── Status: 201 Created
│
├── /{event_id}
│   ├── PATCH (Admin - Update event)
│   │   ├── Auth: Admin token required
│   │   ├── Body: Partial update of above
│   │   ├── Response: MatchEventResponse
│   │   └── Status: 200
│   │
│   └── DELETE (Admin - Delete event)
│       ├── Auth: Admin token required
│       ├── Response: None
│       └── Status: 204 No Content
```

## Database Schema

```
matches TABLE (existing)
├── id (UUID)
├── team_a_id (FK → teams)
├── team_b_id (FK → teams)
├── team_a_score
├── team_b_score
├── status (scheduled, live, completed)
└── ... other fields

    ▲
    │ Foreign Key
    │
match_events TABLE (new) ◄─────────┘
├── id (UUID) PRIMARY KEY
├── match_id (UUID) FK ──────────┐
├── event_type (VARCHAR 20)      │ Indexed for:
├── team (VARCHAR 10)            │ - Fast lookup by match
├── player_name (VARCHAR 100)    │ - Fast filter by type
├── time_minute (INTEGER)        │
├── player_replaced (VARCHAR)    │
├── notes (TEXT)                 │
├── created_at (TIMESTAMP)       │
└── updated_at (TIMESTAMP)       │
                                 │
                            Queries like:
                            - Get all events for match X
                            - Get goals for match X
                            - Get cards for team Y in match X
```

## Authentication Flow

```
1. User logs in (Admin)
   └─ Receive JWT token

2. Token stored in localStorage

3. Every API request includes:
   Authorization: Bearer {token}

4. Backend middleware validates:
   - Token exists
   - Token not expired
   - Token in whitelist (not blacklisted)
   - User is admin

5. If valid: Process request
   If invalid: Return 401 Unauthorized

6. On logout:
   - Token added to blacklist
   - Cannot be reused
```

## Error Handling

```
Frontend Validation (Zod)
        ▼
Invalid format? Show error message
        │
        ├─ Retry ─► Re-validate
        │
        └─ Cancel ─► Close form

Backend Validation (Pydantic)
        ▼
Invalid data? 422 Unprocessable Entity
        │
        ├─ Bad type? Return error
        ├─ Out of range? Return error
        └─ Missing required? Return error

Database Operation
        ▼
Insert fails? Transaction rolled back
        │
        ├─ FK error? Match not found
        ├─ Constraint? Invalid event type
        └─ Other? Log and return 500

All errors caught and returned with:
- Meaningful error message
- HTTP status code
- Field-level details (if applicable)
```

## Performance Optimization

```
Frontend
├── useCallback for fetch functions
│   └─ Prevent unnecessary re-renders
├── memo for timeline component
│   └─ Only re-render if events change
├── Animation with Framer Motion
│   └─ GPU accelerated transforms
└── 30-second refresh interval
    └─ Balance freshness vs server load

Backend
├── Indexed queries on match_id
│   └─ O(log n) lookup instead of O(n)
├── Indexed queries on event_type
│   └─ Fast filtering
├── Connection pooling
│   └─ Reuse DB connections
└── Response caching
    └─ Not cached (live data changes)

Database
├── INDEX on match_id
│   └─ Fast event lookup per match
├── INDEX on event_type
│   └─ Fast filtering by type
├── Foreign key on match_id
│   └─ Automatic cleanup on match delete
└── TIMESTAMP tracking
    └─ Audit trail built-in
```

## Scalability Considerations

### Current Setup
- ✅ Single table for events
- ✅ Indexed for fast queries
- ✅ Neon handles scaling
- ✅ 30-second refresh (not real-time)

### If You Scale Later
- Consider pagination (GET /events?page=1)
- Add event filtering (?type=goal&team=team_a)
- WebSocket for real-time updates
- Event archival (move old events to archive table)
- Caching layer (Redis)

## Deployment Architecture

```
Local Development
├── Frontend: http://localhost:5173
├── Backend: http://localhost:8000
└── Database: Neon cloud

Production Deployment
├── Frontend: Deployed (Vercel, Netlify, etc.)
├── Backend: Render.com
└── Database: Neon.tech (PostgreSQL)

CI/CD Flow
├── Git push to main
├── GitHub Actions run tests
├── Tests pass? Deploy to Render
├── Render redeploys backend
├── New code live in ~2 minutes
```

## Security Architecture

```
Public Endpoints
├── GET /matches/{id}/events
└── No auth required
    └─ Anyone can view

Admin Endpoints
├── POST /matches/{id}/events
├── PATCH /matches/{id}/events/{event_id}
└── DELETE /matches/{id}/events/{event_id}
    └─ Admin JWT token required
    └─ Token validated on each request
    └─ Rate limited to prevent spam

Database Security
├── Connection encrypted (TLS)
├── Password in environment variables
├── Never logged or exposed
└── Neon handles backups

API Security
├── CORS configured
├── HTTPS only (production)
├── Rate limiting on auth endpoints
├── Input validation on all fields
└── SQL injection prevention (prepared statements)
```

---

This architecture ensures:
- **Scalability**: Can handle many events per match
- **Performance**: Fast queries and responsive UI
- **Security**: Admin-only modifications
- **Reliability**: Clean error handling
- **Maintainability**: Clear component separation
- **User Experience**: Real-time updates for viewers
