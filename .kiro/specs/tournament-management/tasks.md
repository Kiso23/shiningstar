# Implementation Plan: Tournament Management

## Overview

Extend the Shining Star United platform from a registration-only system into a full tournament management system. The implementation adds backend models, routers, and a standings service in Python/FastAPI, plus public-facing React pages and admin dashboard tabs in TypeScript/React. Tasks are ordered so each step builds on the previous, ending with full integration.

## Tasks

- [x] 1. Create backend data models and Pydantic schemas
  - [x] 1.1 Create `backend/app/models/match.py` with the `Match` SQLAlchemy model
    - Define all columns: `id`, `team_a_id`, `team_b_id`, `team_a_score`, `team_b_score`, `status`, `round`, `group`, `scheduled_at`, `venue`, `created_at`, `updated_at`
    - Add `ForeignKey` references to `teams.id` for both team columns with `index=True`
    - Add `relationship()` for `team_a` and `team_b` using explicit `foreign_keys`
    - Add `index=True` on `status` and `scheduled_at`
    - _Requirements: 1.1, 3.1_

  - [x] 1.2 Create `backend/app/models/standing.py` with the `Standing` SQLAlchemy model
    - Define all columns: `id`, `team_id` (unique FK), `played`, `wins`, `draws`, `losses`, `goals_scored`, `goals_conceded`, `points`
    - Add `unique=True` and `index=True` on `team_id`
    - Add `goal_difference` as a `@property` (not a stored column)
    - Add `relationship()` to `Team`
    - _Requirements: 5.1, 5.6_

  - [x] 1.3 Register new models in `backend/app/models/__init__.py`
    - Import `Match` and `Standing` so `Base.metadata` picks them up for `create_tables()`
    - _Requirements: 1.1_

  - [x] 1.4 Create `backend/app/schemas/match.py` with Pydantic schemas
    - Implement `MatchCreate` with `@model_validator` enforcing `team_a_id != team_b_id`
    - Implement `MatchUpdate` (all fields optional)
    - Implement `ScoreUpdate` with `ge=0` constraints on score fields and `MatchStatus` enum
    - Implement `MatchResponse` with denormalized `team_a_name` and `team_b_name` fields
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

  - [x] 1.5 Create `backend/app/schemas/standing.py` with `StandingResponse` Pydantic schema
    - Include `goal_difference` as a computed field sourced from the model property
    - Include `team_logo` as `Optional[str]`
    - _Requirements: 5.6_

  - [ ]* 1.6 Write unit tests for Pydantic schema validators
    - Test `MatchCreate.teams_must_differ` raises `ValueError` when both IDs are equal
    - Test `ScoreUpdate` rejects negative score values
    - _Requirements: 1.2, 3.2_

- [x] 2. Implement the standings recalculation service
  - [x] 2.1 Create `backend/app/services/standings_service.py`
    - Implement `async def recalculate_standings(db, team_a_id, team_b_id)` that:
      1. Fetches all `completed` matches for each team
      2. Recalculates `played`, `wins`, `draws`, `losses`, `goals_scored`, `goals_conceded`, `points` from scratch
      3. Upserts the `Standing` row for each team (insert if not exists, update if exists)
    - Keep the function pure of router concerns so it can be tested in isolation
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 5.8, 5.9_

  - [ ]* 2.2 Write property test for standings recalculation — Property 10
    - **Property 10: Match completion correctly updates standings (points, W/D/L, goals)**
    - Use `hypothesis` with `st.integers(min_value=0, max_value=20)` for both scores
    - Verify win/draw/loss assignment and goal totals for all three outcome cases
    - **Validates: Requirements 3.4, 3.5, 3.6, 3.7, 5.8**
    - `# Feature: tournament-management, Property 10`

  - [ ]* 2.3 Write property test for standing recalculation idempotence — Property 15
    - **Property 15: Standing recalculation on result revision**
    - Revise a completed match result twice to the same scores; assert standings are identical after both revisions
    - **Validates: Requirements 5.9**
    - `# Feature: tournament-management, Property 15`

- [x] 3. Implement the matches router
  - [x] 3.1 Create `backend/app/routers/matches.py` registered at `/api/v1/matches`
    - `GET /matches` — public, returns all fixtures ordered by `scheduled_at` asc; supports `?round=` and `?status=` query params
    - `GET /matches/{match_id}` — public, returns single match or 404
    - `POST /matches` — admin-only, creates fixture; validates both team IDs exist (404 if not)
    - `PATCH /matches/{match_id}` — admin-only, updates venue/time/round/group fields
    - `DELETE /matches/{match_id}` — admin-only, deletes fixture, returns 204
    - `PATCH /matches/{match_id}/score` — admin-only, updates scores/status; calls `recalculate_standings` when status → `completed`; returns 409 if match is already `completed`
    - Join `Team` rows to populate `team_a_name` and `team_b_name` in `MatchResponse`
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 3.1, 3.3, 3.8, 4.1, 4.4_

  - [ ]* 3.2 Write property test for fixture creation round-trip — Property 1
    - **Property 1: Fixture creation round-trip**
    - Use `st.uuids()`, `st.datetimes()`, `st.text(min_size=1, max_size=200)` for venue/round
    - Create fixture, fetch by returned ID, assert all fields match
    - **Validates: Requirements 1.1**
    - `# Feature: tournament-management, Property 1`

  - [ ]* 3.3 Write property test for same-team fixture rejection — Property 2
    - **Property 2: Same-team fixture rejection**
    - Use `st.uuids()` for a single team ID used as both `team_a_id` and `team_b_id`
    - Assert response is always 422
    - **Validates: Requirements 1.2**
    - `# Feature: tournament-management, Property 2`

  - [ ]* 3.4 Write property test for fixture update reflects changes — Property 3
    - **Property 3: Fixture update reflects changes**
    - Use `st.text()` for venue, `st.datetimes()` for `scheduled_at`
    - PATCH fixture, assert response contains updated values; GET by ID and assert same values
    - **Validates: Requirements 1.4**
    - `# Feature: tournament-management, Property 3`

  - [ ]* 3.5 Write property test for fixture deletion removes from database — Property 4
    - **Property 4: Fixture deletion removes from database**
    - Create fixture, DELETE it (assert 204), GET by same ID (assert 404)
    - **Validates: Requirements 1.6**
    - `# Feature: tournament-management, Property 4`

  - [ ]* 3.6 Write property test for fixture list ordering — Property 5
    - **Property 5: Fixture list is ordered by scheduled date ascending**
    - Use `st.lists(st.datetimes(), min_size=2, unique=True)` to generate distinct `scheduled_at` values
    - Assert returned list is in strictly ascending order of `scheduled_at`
    - **Validates: Requirements 1.7, 2.1**
    - `# Feature: tournament-management, Property 5`

  - [ ]* 3.7 Write property test for round filtering — Property 6
    - **Property 6: Fixture list filtering by round returns only matching fixtures**
    - Use `st.sampled_from(VALID_ROUNDS)` for round values
    - Assert `GET /matches?round=X` returns only fixtures with `round == X`
    - **Validates: Requirements 1.8**
    - `# Feature: tournament-management, Property 6`

  - [ ]* 3.8 Write property test for fixture response required fields — Property 7
    - **Property 7: Fixture response contains all required fields**
    - For any created fixture, assert `id`, `team_a_name`, `team_b_name`, `scheduled_at`, `venue`, `round`, `status` are all non-null in the list response
    - **Validates: Requirements 2.2**
    - `# Feature: tournament-management, Property 7`

  - [ ]* 3.9 Write property test for score update persistence — Property 8
    - **Property 8: Score update persists scores and sets status to live**
    - Use `st.integers(min_value=0, max_value=20)` for both scores
    - Assert scores are persisted and status is `"live"` after update
    - **Validates: Requirements 3.1**
    - `# Feature: tournament-management, Property 8`

  - [ ]* 3.10 Write property test for negative score rejection — Property 9
    - **Property 9: Negative score values are always rejected**
    - Use `st.integers(max_value=-1)` for score values
    - Assert response is always 422
    - **Validates: Requirements 3.2**
    - `# Feature: tournament-management, Property 9`

  - [ ]* 3.11 Write property test for completed match score update rejection — Property 11
    - **Property 11: Completed match score update is rejected**
    - Create match, mark as completed, attempt score update, assert 409
    - **Validates: Requirements 3.8**
    - `# Feature: tournament-management, Property 11`

  - [ ]* 3.12 Write property test for match fetch required fields — Property 12
    - **Property 12: Match fetch by ID returns all required fields**
    - For any created match, assert `id`, `team_a_name`, `team_b_name`, `status`, `scheduled_at`, `venue`, `round` are non-null
    - **Validates: Requirements 4.4**
    - `# Feature: tournament-management, Property 12`

- [x] 4. Implement the standings router
  - [x] 4.1 Create `backend/app/routers/standings.py` registered at `/api/v1/standings`
    - `GET /standings` — public, returns all standings sorted by: points desc → goal_difference desc → goals_scored desc → team_name asc
    - Join `Team` to populate `team_name` and `team_logo`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 4.2 Write property test for leaderboard ordering — Property 13
    - **Property 13: Leaderboard ordering respects all tiebreakers**
    - Use `st.lists(st.builds(StandingFactory), min_size=2)` to generate varied standings
    - Assert returned list satisfies all four sort criteria in order
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
    - `# Feature: tournament-management, Property 13`

  - [ ]* 4.3 Write property test for leaderboard response required fields — Property 14
    - **Property 14: Leaderboard response contains all required fields**
    - For any team with at least one completed match, assert all required fields are non-null
    - **Validates: Requirements 5.6**
    - `# Feature: tournament-management, Property 14`

- [x] 5. Register new routers in main.py and verify public access
  - Register `matches.router` and `standings.router` in `backend/app/main.py` under `/api/v1`
  - Verify `GET /api/v1/matches` and `GET /api/v1/standings` return 200 without auth headers
  - _Requirements: 2.1, 4.1, 5.1_

- [ ] 6. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Add integration tests for full match lifecycle
  - Extend `backend/tests/test_integration.py` with:
    - [x] 7.1 Full match lifecycle test: create fixture → update score (live) → mark completed → verify standings
      - _Requirements: 1.1, 3.1, 3.4, 5.8_

    - [ ]* 7.2 Result revision integration test
      - Complete a match, revise the result, verify standings recalculated correctly (not doubled)
      - _Requirements: 5.9_

    - [ ]* 7.3 Leaderboard ordering integration test
      - Create multiple teams with known completed match results, verify leaderboard order matches expected ranking
      - _Requirements: 5.2, 5.3, 5.4, 5.5_

    - [ ]* 7.4 Public endpoint access test
      - Verify `/api/v1/matches` and `/api/v1/standings` return 200 without `Authorization` header
      - _Requirements: 2.1, 4.1, 5.1_

- [-] 8. Create frontend API client functions
  - [x] 8.1 Create `frontend/src/api/matches.ts`
    - Implement `getMatches(params?)`, `getMatch(id)`, `createMatch(data)`, `updateMatch(id, data)`, `deleteMatch(id)`, `updateScore(id, data)`
    - Export TypeScript interfaces: `MatchCreate`, `MatchUpdate`, `ScoreUpdate`, `MatchResponse`
    - Follow the existing `client` axios instance pattern from `registrations.ts`
    - _Requirements: 1.1, 1.4, 1.6, 3.1_

  - [x] 8.2 Create `frontend/src/api/standings.ts`
    - Implement `getStandings()` returning `StandingResponse[]`
    - Export `StandingResponse` TypeScript interface with all leaderboard fields
    - _Requirements: 5.1, 5.6_

- [x] 9. Build public frontend pages
  - [x] 9.1 Create `frontend/src/pages/FixturesPage.tsx`
    - Fetch all fixtures via `getMatches()` on mount
    - Group fixtures by `round` and render each group with a section heading
    - Show a live indicator badge for matches with `status === "live"`
    - Show final scores for matches with `status === "completed"`
    - Show loading skeleton and error state with retry button
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 9.2 Create `frontend/src/pages/LeaderboardPage.tsx`
    - Fetch standings via `getStandings()` on mount
    - Render a responsive table with columns: Rank, Team (name + logo), P, W, D, L, GS, GC, GD, Pts
    - Show loading skeleton and error state with retry button
    - _Requirements: 5.7_

  - [x] 9.3 Create `frontend/src/pages/LivePage.tsx`
    - Fetch live matches via `getMatches({ status: "live" })` on mount
    - Display each live match with both team names and current scores
    - Show a friendly empty state message when no matches have `status === "live"`
    - Include a manual refresh button that re-fetches the data
    - _Requirements: 4.2, 4.3_

  - [ ]* 9.4 Write unit tests for leaderboard sorting utility
    - Test all four tiebreaker combinations using Vitest + React Testing Library
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [ ]* 9.5 Write unit tests for fixture grouping by round
    - Test that fixtures are correctly grouped and ordered within each round
    - _Requirements: 2.3_

  - [ ]* 9.6 Write unit tests for live/completed match visual indicators
    - Test that live badge renders for `status === "live"` and score renders for `status === "completed"`
    - _Requirements: 2.4, 2.5_

  - [ ]* 9.7 Write unit tests for empty state on live scores page
    - Test that the empty state message renders when the fixtures list is empty
    - _Requirements: 4.3_

- [x] 10. Register new routes in App.tsx
  - Add `<Route path="/fixtures" element={<FixturesPage />} />` to `frontend/src/App.tsx`
  - Add `<Route path="/leaderboard" element={<LeaderboardPage />} />`
  - Add `<Route path="/live" element={<LivePage />} />`
  - Import the three new page components
  - _Requirements: 2.3, 4.2, 5.7_

- [x] 11. Build admin dashboard fixture management tab
  - [x] 11.1 Create `frontend/src/components/admin/FixtureForm.tsx`
    - Modal form for creating and editing a fixture
    - Fields: Team A (select from approved teams), Team B (select from approved teams), date/time, venue, round (dropdown of valid values), optional group
    - Inline validation: show error if Team A === Team B
    - On submit, call `createMatch` or `updateMatch` and close modal
    - _Requirements: 1.1, 1.2, 1.3, 6.1_

  - [x] 11.2 Create `frontend/src/components/admin/FixturesTab.tsx`
    - Table listing all fixtures with columns: Round, Teams, Date/Time, Venue, Status, Actions
    - Actions: Edit (opens `FixtureForm` pre-filled) and Delete (with confirmation)
    - "Add Fixture" button opens empty `FixtureForm`
    - Show toast notification on success or API error
    - _Requirements: 6.1_

- [x] 12. Build admin dashboard live scores tab
  - [x] 12.1 Create `frontend/src/components/admin/ScoreUpdateForm.tsx`
    - Inline form showing both team names and score inputs
    - Status selector: "scheduled" | "live" | "completed"
    - On submit, call `updateScore` and show toast on success or error
    - Disable score inputs when match status is `"completed"`
    - _Requirements: 3.1, 3.8, 6.2, 6.4, 6.5_

  - [x] 12.2 Create `frontend/src/components/admin/LiveScoresTab.tsx`
    - List all matches with `ScoreUpdateForm` rendered inline for each
    - _Requirements: 6.2, 6.3_

- [x] 13. Integrate new admin tabs into AdminDashboardPage
  - Refactor `frontend/src/pages/AdminDashboardPage.tsx` to use a tab navigation pattern
  - Add "Registrations" tab (existing content), "Fixtures" tab (`FixturesTab`), and "Live Scores" tab (`LiveScoresTab`)
  - Preserve all existing registration management functionality unchanged
  - _Requirements: 6.1, 6.2_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use Hypothesis (backend) and Vitest (frontend)
- The standings recalculation runs inside the same DB transaction as the match status update — if it fails, the whole transaction rolls back
- The `goal_difference` field is a computed `@property` on the `Standing` model, not a stored column
- Public endpoints (`/matches`, `/standings`) require no authentication
- Admin endpoints (`POST/PATCH/DELETE /matches`) require the existing JWT bearer token
