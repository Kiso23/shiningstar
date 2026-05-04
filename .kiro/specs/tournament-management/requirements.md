# Requirements Document

## Introduction

This document defines the requirements for the Tournament Management feature of the Shining Star United Football Tournament Registration System. The feature extends the existing registration system with three interconnected capabilities: a public leaderboard showing team standings, an admin-managed match fixture schedule, and a live score update system visible to all users. These features transform the platform from a registration-only tool into a full tournament management system.

## Glossary

- **Tournament_System**: The Shining Star United Football Tournament Registration System (backend + frontend)
- **Admin**: An authenticated administrator with access to the admin dashboard
- **Team**: A registered football team with an approved registration in the system
- **Match**: A scheduled game between two Teams, with a defined date, time, venue, and round/group
- **Fixture**: A planned Match entry in the tournament schedule
- **Score**: The number of goals recorded for each Team in a completed or ongoing Match
- **Leaderboard**: The ranked table of Teams sorted by tournament standings
- **Standing**: A Team's cumulative tournament statistics (points, wins, draws, losses, goals scored, goals conceded, goal difference)
- **Points**: Tournament points awarded per Match result: 3 for a win, 1 for a draw, 0 for a loss
- **Goal_Difference**: Goals scored minus goals conceded for a given Team
- **Round**: A named stage of the tournament (e.g., "Group Stage", "Quarter-Final", "Semi-Final", "Final")
- **Group**: An optional subdivision within a Round (e.g., "Group A", "Group B")
- **Live_Match**: A Match whose status is set to "live" by an Admin
- **Venue**: The physical location where a Match is played
- **Public_User**: Any visitor to the frontend website, authenticated or not

---

## Requirements

### Requirement 1: Match Fixture Management

**User Story:** As an Admin, I want to create and manage the match schedule, so that all participants and viewers can see when and where each game is being played.

#### Acceptance Criteria

1. WHEN an Admin submits a valid fixture creation request with Team A, Team B, date, time, venue, round, and optional group, THE Tournament_System SHALL persist the Fixture to the database and return the created Fixture with a unique identifier.
2. IF an Admin submits a fixture creation request where Team A and Team B are the same team, THEN THE Tournament_System SHALL reject the request with a descriptive validation error.
3. IF an Admin submits a fixture creation request with a missing required field (Team A, Team B, date, time, venue, or round), THEN THE Tournament_System SHALL reject the request with a descriptive validation error identifying the missing field.
4. WHEN an Admin submits a valid fixture update request for an existing Fixture, THE Tournament_System SHALL update the specified fields and return the updated Fixture.
5. IF an Admin submits a fixture update request for a Fixture identifier that does not exist, THEN THE Tournament_System SHALL return a 404 error.
6. WHEN an Admin submits a valid fixture deletion request for an existing Fixture, THE Tournament_System SHALL remove the Fixture from the database and return a 204 No Content response.
7. THE Tournament_System SHALL support ordering fixtures by date and time in ascending order when listing all fixtures.
8. THE Tournament_System SHALL support filtering fixtures by round when listing fixtures.
9. THE Tournament_System SHALL support filtering fixtures by group when listing fixtures.

---

### Requirement 2: Public Fixture Viewing

**User Story:** As a Public_User, I want to view the full match schedule, so that I can plan to attend or follow specific games.

#### Acceptance Criteria

1. THE Tournament_System SHALL expose a public (unauthenticated) API endpoint that returns all Fixtures ordered by date and time ascending.
2. WHEN a Public_User requests the fixtures list, THE Tournament_System SHALL return each Fixture including Team A name, Team B name, date, time, venue, round, group (if set), and match status.
3. THE Tournament_System SHALL render a Fixtures page in the frontend that displays all matches grouped by Round.
4. WHILE a Match status is "live", THE Tournament_System SHALL visually distinguish that Fixture on the Fixtures page with a live indicator.
5. WHILE a Match status is "completed", THE Tournament_System SHALL display the final Score alongside the Fixture on the Fixtures page.

---

### Requirement 3: Live Score Management

**User Story:** As an Admin, I want to update match scores in real-time during games, so that viewers can follow the tournament live.

#### Acceptance Criteria

1. WHEN an Admin submits a score update request for an existing Match with valid non-negative integer scores for both teams, THE Tournament_System SHALL persist the updated scores and set the Match status to "live".
2. IF an Admin submits a score update request with a negative score value, THEN THE Tournament_System SHALL reject the request with a descriptive validation error.
3. IF an Admin submits a score update request for a Match identifier that does not exist, THEN THE Tournament_System SHALL return a 404 error.
4. WHEN an Admin marks a Match as completed, THE Tournament_System SHALL set the Match status to "completed" and update the Standing for both participating Teams based on the final Score.
5. WHEN a Match is marked as completed, THE Tournament_System SHALL award 3 points to the winning Team, 1 point to each Team in the event of a draw, and 0 points to the losing Team.
6. WHEN a Match is marked as completed, THE Tournament_System SHALL increment the wins, draws, or losses counter for each participating Team according to the Match result.
7. WHEN a Match is marked as completed, THE Tournament_System SHALL add the goals scored and goals conceded to each Team's Standing totals.
8. IF an Admin attempts to update the score of a Match whose status is "completed", THEN THE Tournament_System SHALL reject the request with a descriptive error indicating the Match is already completed.

---

### Requirement 4: Public Live Score Viewing

**User Story:** As a Public_User, I want to view live scores during matches, so that I can follow the tournament in real-time without attending in person.

#### Acceptance Criteria

1. THE Tournament_System SHALL expose a public (unauthenticated) API endpoint that returns all Matches with status "live", including current scores for both teams.
2. THE Tournament_System SHALL render a Live Scores section in the frontend that displays all Live_Matches with their current scores.
3. WHILE no matches have status "live", THE Tournament_System SHALL display a message indicating no live matches are currently in progress.
4. THE Tournament_System SHALL expose a public API endpoint that returns a single Match by identifier, including its current score and status.

---

### Requirement 5: Leaderboard

**User Story:** As a Public_User, I want to view the team standings leaderboard, so that I can see which teams are performing best in the tournament.

#### Acceptance Criteria

1. THE Tournament_System SHALL expose a public (unauthenticated) API endpoint that returns the Leaderboard as an ordered list of Standings.
2. THE Tournament_System SHALL rank Teams on the Leaderboard in descending order of Points.
3. WHEN two or more Teams have equal Points, THE Tournament_System SHALL rank them by Goal_Difference in descending order.
4. WHEN two or more Teams have equal Points and equal Goal_Difference, THE Tournament_System SHALL rank them by goals scored in descending order.
5. WHEN two or more Teams have equal Points, equal Goal_Difference, and equal goals scored, THE Tournament_System SHALL rank them alphabetically by team name in ascending order.
6. THE Tournament_System SHALL include the following fields for each Team in the Leaderboard: team name, team logo (if available), matches played, wins, draws, losses, goals scored, goals conceded, Goal_Difference, and Points.
7. THE Tournament_System SHALL render a Leaderboard page in the frontend that displays the standings table with all fields defined in criterion 6.
8. THE Tournament_System SHALL update a Team's Standing automatically whenever a Match involving that Team is marked as completed.
9. WHEN a completed Match result is revised by an Admin, THE Tournament_System SHALL recalculate the affected Teams' Standings to reflect the corrected result.

---

### Requirement 6: Admin Score and Fixture Interface

**User Story:** As an Admin, I want a dedicated section in the admin dashboard to manage fixtures and scores, so that I can efficiently run the tournament without leaving the admin interface.

#### Acceptance Criteria

1. THE Tournament_System SHALL add a Fixtures management tab to the existing admin dashboard that allows Admins to create, edit, and delete Fixtures.
2. THE Tournament_System SHALL add a Live Scores management tab to the existing admin dashboard that allows Admins to update scores and change Match status.
3. WHEN an Admin updates a score from the admin dashboard, THE Tournament_System SHALL reflect the updated score on the public Live Scores page within 5 seconds of a manual page refresh.
4. THE Tournament_System SHALL display both Teams' names and current scores on the admin score update interface for each Match.
5. THE Tournament_System SHALL allow an Admin to set a Match status to one of: "scheduled", "live", or "completed" from the admin dashboard.
