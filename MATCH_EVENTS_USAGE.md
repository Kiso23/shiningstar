# Match Events - Usage Guide

## For Viewers (Live Scores Page)

### What They See

```
┌─────────────────────────────────────────┐
│  ⚪ LIVE ⚪                              │
│                                         │
│        SSU          vs       ECO        │
│      (logo)                (logo)       │
│                                         │
│        2           -           1        │
│                                         │
│  Final · Rongbong Rongbang Playground  │
├─────────────────────────────────────────┤
│           ⚡ Match Events                │
├─────────────────────────────────────────┤
│                                         │
│  ⚽ John Doe (SSU)         35'  Goal    │
│                                         │
│  🟨 Mike Smith (ECO)       42' YellowCard│
│                                         │
│  ⚽ Sarah Khan (SSU)       67'  Goal    │
│                                         │
│  🔄 Ahmad Hassan (SSU)     75' Subst.   │
│     Replaced: Raj Kumar                 │
│                                         │
│  🔴 Tom Brady (ECO)        80' RedCard  │
│                                         │
└─────────────────────────────────────────┘
```

### Timeline Display

Each event shows:
- **Icon** (⚽ Goal, 🟨 Yellow, 🔴 Red, 🔄 Sub, ⚡ Own Goal)
- **Player Name** (who the action involved)
- **Team Name** (which team they're on)
- **Time** (in minutes)
- **Event Type** (label at bottom)

**Colors:**
- Green = Goal/Own Goal
- Yellow = Yellow Card
- Red = Red Card
- Blue = Substitution

### Auto-Refresh

The page automatically refreshes events every 30 seconds, so viewers always see the latest action without manually refreshing.

---

## For Admin (Admin Dashboard)

### Step 1: Navigate to Live Scores

```
Admin Dashboard
    ↓
Live Scores Tab
    ↓
See all matches grouped by status
```

### Step 2: Find Live Match

**Live** (green indicator)
```
┌─────────────────────────────────┐
│ 🟢 LIVE (1)                     │
├─────────────────────────────────┤
│                                 │
│  SSU vs ECO                     │
│                                 │
│  [Update Score] [Add Event] 👈  │
│                                 │
└─────────────────────────────────┘
```

### Step 3: Click "Add Event" Button

Modal opens:

```
┌───────────────────────────────────────────────┐
│ Match Events: SSU vs ECO           ❌         │
├───────────────────────────────────────────────┤
│                                               │
│ RECORDED EVENTS                               │
│ ┌─────────────────────────────────────────┐  │
│ │ ⚽ John Doe (SSU)         35'  Goal      │  │
│ └─────────────────────────────────────────┘  │
│                                               │
│ ────────────────────────────────────────────  │
│                                               │
│ ADD NEW EVENT                                 │
│                                               │
│ Event Type:  [Goal ▼]                        │
│              - ⚽ Goal                         │
│              - ⚡ Own Goal                    │
│              - 🟨 Yellow Card                 │
│              - 🔴 Red Card                    │
│              - 🔄 Substitution               │
│                                               │
│ Team: [SSU ▼]                                │
│       - SSU                                   │
│       - ECO                                   │
│                                               │
│ Player Name: [_________________]              │
│              e.g., John Doe                   │
│                                               │
│ Time (minutes): [___]                         │
│                 0-200                         │
│                                               │
│ Player Replaced: [_________________]          │
│                  (only for substitutions)     │
│                                               │
│ Notes (optional): [____________________]      │
│                   Add any details             │
│                                               │
│                  [Create Event]               │
│                                               │
└───────────────────────────────────────────────┘
```

### Step 4: Fill in Event Details

Example for a goal:

```
Event Type:  ⚽ Goal
Team:        SSU
Player Name: Sarah Khan
Time:        67 (minutes)
Notes:       (empty)

[Create Event]
```

### Step 5: Event Appears

Success message shows:
```
✅ Event added successfully!
```

Event appears in both:
- **Admin form** (in "Recorded Events" section)
- **Live Scores public page** (viewers see it immediately)

---

## Complete Example: Match Timeline

### Scenario: SSU vs ECO Match

**30 minutes:** Goal by SSU
```
Event Type:   ⚽ Goal
Team:         SSU
Player Name:  John Doe
Time:         30
```

**42 minutes:** Yellow Card to ECO player
```
Event Type:   🟨 Yellow Card
Team:         ECO
Player Name:  Mike Smith
Time:         42
```

**45 minutes:** Own Goal (tragic!)
```
Event Type:   ⚡ Own Goal
Team:         ECO
Player Name:  Defender Name
Time:         45
Notes:        Unfortunate own goal
```

**67 minutes:** Second Goal for SSU
```
Event Type:   ⚽ Goal
Team:         SSU
Player Name:  Sarah Khan
Time:         67
Notes:        Great header
```

**75 minutes:** Substitution
```
Event Type:   🔄 Substitution
Team:         SSU
Player Name:  Ahmad Hassan (came in)
Player Replaced: Raj Kumar (went out)
Time:         75
```

**80 minutes:** Red Card (sent off!)
```
Event Type:   🔴 Red Card
Team:         ECO
Player Name:  Tom Brady
Time:         80
Notes:        Violent conduct
```

### Final Timeline as Viewers See It

```
⚽ John Doe (SSU)           30' Goal
🟨 Mike Smith (ECO)        42' Yellow Card
⚡ Defender (ECO)          45' Own Goal
⚽ Sarah Khan (SSU)        67' Goal
🔄 Ahmad Hassan (SSU)      75' Substitution
   Replaced by: Raj Kumar
🔴 Tom Brady (ECO)         80' Red Card
```

### Final Score
```
SSU: 3 goals (2 regular + 1 own goal by ECO)
ECO: 0 goals
```

---

## Tips & Best Practices

### ✅ Do's
- Record events **as they happen** (don't wait until end of match)
- Use **full player names** so viewers know who scored
- Add **notes for important moments** (free kick, header, penalty, etc.)
- Keep times **accurate** (pause the video to check)
- Record **all cards** (helps with discipline tracking)

### ❌ Don'ts
- Don't record events **after match ends**
- Don't use **nicknames only** (put full name)
- Don't forget **team selection** (important!)
- Don't mix up **time field** with score field
- Don't close modal **before clicking Create Event**

### 💡 Quick Tips
- **Keyboard shortcuts**: Tab through fields quickly
- **Quick copy**: If same player scores again, use same name
- **Undo**: Click delete (trash icon) to remove wrong entry
- **Mobile**: Form scrolls if needed, buttons stay at bottom
- **API ready**: Can integrate events into other apps via `/api/v1/matches/{id}/events`

---

## Event Statistics

After recording events, you can see:

```
Match Events Summary
├─ Total Goals Team A: 2
├─ Total Goals Team B: 0
├─ Yellow Cards Team A: 1
├─ Yellow Cards Team B: 2
├─ Red Cards Team A: 0
└─ Red Cards Team B: 1
```

These stats help you understand match discipline and performance.

---

## Troubleshooting During Match

| Problem | Solution |
|---------|----------|
| "Add Event" button missing | Make sure match status is "LIVE" |
| Event doesn't appear | Click Create Event (not just fill form) |
| Wrong time recorded | Edit event - click pencil icon |
| Duplicate entry | Click delete on the duplicate |
| Form is scrolling too much | Use mobile view - form is optimized for it |
| Player name too long | Abbreviate but keep recognizable (e.g., "M. Smith") |

---

## API for Developers

If you want to integrate events into a custom app or video feed:

```javascript
// Get all events for a match
GET /api/v1/matches/{match_id}/events

Response:
{
  "match_id": "uuid",
  "events": [
    {
      "id": "event-id",
      "event_type": "goal",
      "team": "team_a",
      "player_name": "John Doe",
      "time_minute": 30,
      "notes": null
    }
  ],
  "total_goals_team_a": 2,
  "total_goals_team_b": 0
}
```

```javascript
// Create an event programmatically
POST /api/v1/matches/{match_id}/events

{
  "event_type": "goal",
  "team": "team_a",
  "player_name": "John Doe",
  "time_minute": 30
}
```

---

## Real-World Example

**Match: SSU vs ECO (Final) - Live Commentary**

```
12:30 PM: Match Starts
Admin records: Match status = LIVE

12:35 PM: GOAL SSU!
Admin adds: ⚽ John Doe (SSU) at 5 minutes
Viewers see: Event appears immediately

12:42 PM: Card! ECO player
Admin adds: 🟨 Mike Smith (ECO) at 12 minutes
Viewers see: Yellow card notification

12:47 PM: Own Goal! ECO defense error
Admin adds: ⚡ Defender (ECO) at 17 minutes
Viewers see: Critical own goal recorded

... (Match continues) ...

1:47 PM: FINAL WHISTLE
Admin updates: Match status = COMPLETED
Full timeline now shows all events
Viewers can review entire match

Result: SSU 3-0 ECO
```

---

**Next**: Go to MATCH_EVENTS_SETUP.md to set up the database and deploy!
