# Implementation Plan: Football Tournament Registration Website — Shining Star United

## Overview

Full-stack implementation of the Shining Star United tournament registration system. The backend is a FastAPI application with SQLAlchemy async ORM, and the frontend is a React SPA with Tailwind CSS and Framer Motion. Tasks are ordered so each step builds on the previous: backend foundation first, then services and routers, then the frontend shell, then feature pages, and finally integration wiring.

---

## Tasks

- [x] 1. Backend — Project Setup and Configuration
  - Create the `backend/` directory with the full module structure: `app/main.py`, `app/config.py`, `app/database.py`, `app/models/`, `app/schemas/`, `app/routers/`, `app/services/`, `app/dependencies/`, `app/utils/`
  - Write `app/config.py` using `pydantic-settings` with all settings from the design: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `UPLOAD_DIR`, `MAX_LOGO_SIZE_BYTES`, `MAX_PAYMENT_PROOF_SIZE_BYTES`, `ALLOWED_IMAGE_MIME_TYPES`, `CORS_ORIGINS`
  - Write `app/database.py` with async SQLAlchemy engine and session factory, supporting both `aiosqlite` (SQLite) and `asyncpg` (PostgreSQL) via `DATABASE_URL`
  - Write `app/main.py` as the FastAPI app factory with CORS middleware, lifespan handler for DB table creation, and router registration stubs
  - Create `backend/requirements.txt` pinning: `fastapi`, `uvicorn[standard]`, `sqlalchemy[asyncio]`, `aiosqlite`, `asyncpg`, `pydantic[email]`, `pydantic-settings`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`, `openpyxl`, `hypothesis`, `pytest`, `pytest-asyncio`, `httpx`
  - Create `backend/.env.example` with all required environment variable keys (no real values)
  - _Requirements: 9.1_

- [x] 2. Backend — ORM Models
  - Write `app/models/team.py` with the `Team` SQLAlchemy model: all columns from the design schema, `players` and `payment_proof` relationships, `registration_id` unique index
  - Write `app/models/player.py` with the `Player` model: `team_id` FK, `full_name`, `age`, `position_index`, back-reference to `Team`
  - Write `app/models/admin.py` with the `Admin` model: `email` unique index, `password_hash`
  - Add a `payment_proof` model in `app/models/payment_proof.py` with the `PaymentProof` model: `team_id` unique FK, `file_path`, `original_filename`, `mime_type`, `file_size_bytes`, `uploaded_at`
  - Export all models from `app/models/__init__.py` so Alembic and the lifespan handler can discover them
  - _Requirements: 2.3, 3.4, 4.4, 6.7_

- [x] 3. Backend — Pydantic Schemas
  - Write `app/schemas/common.py` with `RegistrationStatus` enum (`pending`, `payment_submitted`, `approved`, `rejected`) and the standard error envelope schema
  - Write `app/schemas/team.py` with `TeamCreate` (phone regex `^\d{10}$`, `player_count` ge=7 le=18), `TeamResponse`, `TeamDetailResponse` (includes players and payment proof)
  - Write `app/schemas/player.py` with `PlayerCreate` (age ge=5 le=60) and `PlayerResponse`
  - Write `app/schemas/auth.py` with `LoginRequest`, `TokenResponse`
  - Write `app/schemas/admin.py` with `PaginatedTeamList`, `StatusUpdateRequest`, `ExportFormat` enum
  - _Requirements: 2.1, 2.4, 2.5, 2.6, 3.2, 3.5, 9.4_

- [x] 4. Backend — Utility Modules
  - Write `app/utils/file_storage.py` with `save_file(dest_dir, filename_prefix, file_bytes) -> str` and `delete_file(path) -> None` abstracting all `os.path` operations
  - Write `app/utils/sanitize.py` with `sanitize_text(value: str) -> str` that strips HTML tags and escapes SQL-special characters from user-supplied strings
  - Write `app/dependencies/db.py` with the `get_db` async generator dependency
  - Write `app/dependencies/auth.py` with `get_current_admin` dependency that extracts and verifies the Bearer JWT, raising 401/403 on failure
  - _Requirements: 9.2, 9.3, 9.6_

- [x] 5. Backend — Auth Service and Router
  - Write `app/services/auth_service.py` with:
    - `hash_password(plain: str) -> str` using `passlib` bcrypt
    - `verify_password(plain: str, hashed: str) -> bool`
    - `create_access_token(data: dict) -> str` signing with `SECRET_KEY`, expiry from settings
    - `decode_access_token(token: str) -> dict` raising on expiry or invalid signature
  - Write `app/routers/auth.py` with `POST /api/v1/auth/login`: look up admin by email, verify bcrypt hash, return JWT or 401
  - Add a CLI seed script `backend/scripts/create_admin.py` that creates the first admin account (email + password from env or args) using `hash_password`
  - _Requirements: 6.1, 6.2, 6.3, 6.7_

  - [ ]* 5.1 Write property test for password storage (Property 8)
    - **Property 8: Password storage — no plaintext**
    - Use `hypothesis` with `st.text()` to generate random passwords; assert `hash_password(p) != p` and `verify_password(p, hash_password(p)) == True`
    - Tag: `Feature: football-tournament-registration, Property 8: Password storage — no plaintext`
    - **Validates: Requirements 6.7**

- [x] 6. Backend — Registration Service and `registration_id` Generation
  - Write `app/services/registration_service.py` with:
    - `generate_registration_id() -> str` producing `SSU-{YYYYMMDD}-{6-char-random-uppercase}`
    - `create_team(db, data: TeamCreate) -> Team` — sanitize text fields, generate `registration_id`, insert, return ORM object
    - `create_players(db, team_id, players: List[PlayerCreate]) -> List[Player]` — bulk insert with `position_index`
    - `get_team(db, registration_id: str) -> Team | None`
    - `update_team_status(db, team_id, new_status: RegistrationStatus) -> Team` — enforce forward-only transitions, raise 409 on invalid transition
  - _Requirements: 2.3, 3.1, 3.4, 4.4, 7.3, 7.4_

  - [ ]* 6.1 Write property test for registration ID uniqueness (Property 1)
    - **Property 1: Registration ID uniqueness**
    - Use `hypothesis` with `st.integers(min_value=2, max_value=200)` to generate N; call `generate_registration_id()` N times and assert all IDs are distinct
    - Tag: `Feature: football-tournament-registration, Property 1: Registration ID uniqueness`
    - **Validates: Requirements 2.3**

  - [ ]* 6.2 Write property test for player roster integrity (Property 2)
    - **Property 2: Player roster integrity**
    - Use `hypothesis` with `st.integers(min_value=7, max_value=18)` for N; create a team with `player_count=N`, submit N players, assert `len(team.players) == N` and all player names are retrievable
    - Tag: `Feature: football-tournament-registration, Property 2: Player roster integrity`
    - **Validates: Requirements 3.1, 3.4**

  - [ ]* 6.3 Write property test for status transition monotonicity (Property 3)
    - **Property 3: Status transition monotonicity**
    - Use `hypothesis` with `st.sampled_from(RegistrationStatus)` for source and target; assert that only the transitions `pending→payment_submitted`, `payment_submitted→approved`, `payment_submitted→rejected` succeed, and all others raise an error
    - Tag: `Feature: football-tournament-registration, Property 3: Status transition monotonicity`
    - **Validates: Requirements 2.3, 4.4, 7.3, 7.4**

- [x] 7. Backend — Payment Service and Router
  - Write `app/services/payment_service.py` with:
    - `validate_file(mime_type: str, size_bytes: int, max_bytes: int) -> None` raising 400 if MIME not in allowed list or size exceeds limit
    - `store_payment_proof(db, team_id, file: UploadFile) -> PaymentProof` — validate, write via `file_storage.save_file`, insert `PaymentProof` record, update team status; delete file on DB failure
    - `validate_logo(mime_type: str, size_bytes: int) -> None` using `MAX_LOGO_SIZE_BYTES`
  - Write `app/routers/registrations.py` with all four public endpoints:
    - `POST /api/v1/registrations` — validate `TeamCreate`, create team, return `registration_id` and status
    - `POST /api/v1/registrations/{id}/players` — validate player list, associate with team
    - `POST /api/v1/registrations/{id}/payment` — multipart upload, delegate to `payment_service`
    - `GET /api/v1/registrations/{id}/status` — return current status
  - _Requirements: 2.2, 4.1, 4.3, 4.4, 4.6, 9.5_

  - [ ]* 7.1 Write property test for file type and size enforcement (Property 4)
    - **Property 4: File type and size enforcement**
    - Use `hypothesis` with `st.text()` for MIME type and `st.integers()` for size; assert `validate_file` accepts only `image/jpeg`/`image/png` under the configured limit and rejects everything else
    - Tag: `Feature: football-tournament-registration, Property 4: File type and size enforcement`
    - **Validates: Requirements 2.2, 4.3, 9.5**

- [x] 8. Backend — Server-Side Validation (API-level property test)
  - Ensure all `TeamCreate` and `PlayerCreate` Pydantic validators are wired into the registration router so invalid payloads return 400 with `field_errors`
  - Add server-side sanitization calls in `create_team` and `create_players` using `sanitize_text`
  - _Requirements: 2.4, 2.5, 2.6, 3.5, 9.4, 9.6_

  - [ ]* 8.1 Write property test for server-side validation (Property 5)
    - **Property 5: Server-side validation rejects invalid registration payloads**
    - Use `hypothesis` with strategies generating malformed `TeamCreate` payloads (missing fields, non-10-digit phones, invalid emails, `player_count` outside [7,18]); POST each to the API via `httpx.AsyncClient`; assert HTTP 400 and no new DB record
    - Tag: `Feature: football-tournament-registration, Property 5: Server-side validation rejects invalid payloads`
    - **Validates: Requirements 2.4, 2.5, 2.6, 3.5, 9.4**

  - [ ]* 8.2 Write property test for input sanitization (Property 11)
    - **Property 11: Input sanitization preserves data without injection risk**
    - Use `hypothesis` with `st.text()` including SQL injection and XSS payloads; call `sanitize_text(input)` and write to DB; assert no unhandled exception is raised and the stored value does not contain raw `<script>` tags or unescaped SQL metacharacters
    - Tag: `Feature: football-tournament-registration, Property 11: Input sanitization`
    - **Validates: Requirements 9.6**

- [x] 9. Backend — Admin Service and Router
  - Write `app/services/admin_service.py` (or extend `registration_service`) with:
    - `list_registrations(db, page, page_size, status_filter, search) -> PaginatedTeamList` — paginated SELECT with optional WHERE clauses for status and case-insensitive name search
    - `get_registration_detail(db, registration_id) -> TeamDetailResponse`
    - `update_registration_status(db, registration_id, new_status) -> TeamResponse`
  - Write `app/routers/admin.py` with all protected endpoints, each guarded by `get_current_admin`:
    - `GET /api/v1/admin/registrations` (pagination + filter + search)
    - `GET /api/v1/admin/registrations/{id}`
    - `PATCH /api/v1/admin/registrations/{id}/status`
    - `GET /api/v1/admin/registrations/{id}/payment-proof` (serve file via `FileResponse`)
    - `GET /api/v1/admin/export`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 9.1 Write property test for admin endpoint authorization (Property 6)
    - **Property 6: Admin endpoint authorization**
    - Use `hypothesis` with strategies generating missing tokens, expired tokens, tokens with tampered signatures, and tokens with wrong algorithms; assert every admin endpoint returns 401 or 403 for all invalid token variants
    - Tag: `Feature: football-tournament-registration, Property 6: Admin endpoint authorization`
    - **Validates: Requirements 6.4, 6.5, 6.6, 9.2, 9.3**

  - [ ]* 9.2 Write property test for status filter correctness (Property 9)
    - **Property 9: Status filter returns only matching teams**
    - Use `hypothesis` with `st.lists(st.sampled_from(RegistrationStatus))` to seed the DB with teams of mixed statuses; call `list_registrations(status=s)` for each status value; assert every returned team has `status == s`
    - Tag: `Feature: football-tournament-registration, Property 9: Status filter returns only matching teams`
    - **Validates: Requirements 7.6**

  - [ ]* 9.3 Write property test for search correctness (Property 10)
    - **Property 10: Search returns only matching teams**
    - Use `hypothesis` with `st.text(min_size=1)` for search queries and `st.lists(st.text())` for team/manager names; seed DB, call `list_registrations(search=q)`; assert every returned team has `team_name` or `manager_name` containing `q` (case-insensitive)
    - Tag: `Feature: football-tournament-registration, Property 10: Search returns only matching teams`
    - **Validates: Requirements 7.7**

- [x] 10. Backend — Export Service
  - Write `app/services/export_service.py` with:
    - `generate_csv(db) -> bytes` — query all teams and players, write CSV with two sections (team rows then player rows) including all required fields from Requirements 8.4 and 8.5
    - `generate_xlsx(db) -> bytes` — same data as CSV but written to an `openpyxl` workbook with two sheets: "Teams" and "Players"
  - Wire the export endpoint in `app/routers/admin.py` to call the appropriate generator based on `?format=csv|xlsx` query param and return with correct `Content-Disposition` header
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 10.1 Write property test for export completeness (Property 7)
    - **Property 7: Export completeness and field coverage**
    - Use `hypothesis` with `st.lists(st.builds(...))` to generate random sets of teams and players; seed DB; call `generate_csv(db)`; parse the output; assert team row count equals number of teams, player row count equals total players, and all required columns are present in every row
    - Tag: `Feature: football-tournament-registration, Property 7: Export completeness and field coverage`
    - **Validates: Requirements 8.1, 8.4, 8.5**

- [x] 11. Backend — Integration Tests
  - Write `backend/tests/test_integration.py` using `pytest-asyncio` and `httpx.AsyncClient` against an in-memory SQLite database:
    - Full wizard flow: `POST /registrations` → `POST /registrations/{id}/players` → `POST /registrations/{id}/payment` → `GET /registrations/{id}/status` — assert status progresses correctly
    - Admin login → `GET /admin/registrations` → `PATCH /admin/registrations/{id}/status` (approve and reject)
    - File upload: valid JPEG accepted (200), valid PNG accepted (200), non-image rejected (400), oversized file rejected (413)
    - Export endpoint: returns 200 with `text/csv` content type and correct row count
    - Auth guard: unauthenticated requests to all admin endpoints return 401 or 403
  - _Requirements: 2.3, 3.4, 4.3, 4.4, 6.4, 7.3, 7.4, 8.1, 9.2, 9.3_

- [x] 12. Backend Checkpoint — Ensure all tests pass
  - Run `pytest backend/` and confirm all unit, property, and integration tests pass with zero failures. Ask the user if any questions arise before proceeding to the frontend.

- [x] 13. Frontend — Project Setup
  - Scaffold the React project in `frontend/` using Vite with the TypeScript template
  - Install and configure Tailwind CSS v3 with the `@tailwindcss/forms` plugin
  - Install `framer-motion`, `react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers`, `axios`, `zustand`, `fast-check`
  - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `axe-core`, `@axe-core/react`
  - Configure `vite.config.ts` with the API proxy (`/api` → `http://localhost:8000`) for local development
  - Create `frontend/.env.example` with `VITE_API_BASE_URL`
  - _Requirements: 10.1, 10.3_

- [x] 14. Frontend — API Client and Stores
  - Write `src/api/client.ts`: Axios instance with `baseURL` from env, request interceptor to attach `Authorization: Bearer` header from localStorage, response interceptor to redirect to `/admin/login` on 401 from admin routes
  - Write `src/api/registrations.ts` with typed functions: `createTeam`, `submitPlayers`, `uploadPayment`, `getStatus`
  - Write `src/api/auth.ts` with `login(email, password) -> TokenResponse`
  - Write `src/api/admin.ts` with `listRegistrations`, `getRegistrationDetail`, `updateStatus`, `getExportUrl`
  - Write `src/store/registrationStore.ts` as a Zustand store holding: `currentStep`, `registrationId`, `teamData`, `playerData`, `setStep`, `setRegistrationId`, `setTeamData`, `setPlayerData`, `reset`
  - Write `src/hooks/useAdminAuth.ts` managing JWT in localStorage: `login`, `logout`, `isAuthenticated`
  - _Requirements: 6.4, 6.5, 6.6_

- [x] 15. Frontend — Shared Components
  - Write `src/components/shared/ProtectedRoute.tsx`: wraps admin routes, redirects to `/admin/login` if `useAdminAuth().isAuthenticated` is false
  - Write `src/components/shared/FileUpload.tsx`: drag-and-drop file input accepting configurable MIME types and max size, retains the `File` object in state on upload failure so the user can retry without re-selecting
  - Write `src/components/shared/ErrorBoundary.tsx`: catches render errors and displays a fallback UI
  - Set up `src/App.tsx` with `react-router-dom` routes: `/` (HomePage), `/register` (RegisterPage), `/confirmation/:id` (ConfirmationPage), `/admin/login` (AdminLoginPage), `/admin/dashboard` (AdminDashboardPage wrapped in ProtectedRoute)
  - _Requirements: 4.6, 6.4, 6.5_

- [x] 16. Frontend — Homepage
  - Write `src/pages/HomePage.tsx` displaying tournament name, date, venue, and prize details from static config or environment variables
  - Include a "Register Now" CTA button that navigates to `/register`
  - Apply Tailwind responsive classes so the layout is single-column on mobile (≥ 320 px) and multi-column on desktop
  - Add descriptive `alt` text to all non-decorative images (tournament banner, sponsor logos)
  - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.4, 10.5_

- [x] 17. Frontend — Registration Wizard Shell and Step Indicator
  - Write `src/hooks/useRegistrationWizard.ts` managing `currentStep` (1–4), `goNext`, `goPrev`, and reading/writing the Zustand store
  - Write `src/components/registration/StepIndicator.tsx`: renders step dots or a progress bar showing steps 1–4 with active/completed/upcoming states, animated with Framer Motion
  - Write `src/pages/RegisterPage.tsx` as the wizard host: renders `StepIndicator` and conditionally renders the active step component based on `currentStep`
  - _Requirements: 2.1, 3.1, 4.1, 5.1_

- [x] 18. Frontend — Step 1: Team Details Form
  - Write `src/components/registration/TeamDetailsStep.tsx` using React Hook Form + Zod
  - Zod schema must validate: `team_name` (non-empty, ≤100 chars), `manager_name` (non-empty, ≤100 chars), `contact_phone` (exactly 10 digits), `contact_email` (valid email), `player_count` (integer 7–18)
  - Include optional team logo upload using `FileUpload` component (JPEG/PNG, ≤2 MB)
  - On valid submit: call `createTeam` API, store `registrationId` in Zustand, advance to step 2
  - Display inline validation errors for each field on submit attempt; display a retry toast on server error (Req 2.7)
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 18.1 Write fast-check property test for Team Details Zod schema (Property 5 — frontend)
    - **Property 5 (frontend): Zod schema rejects invalid team registration payloads**
    - Use `fast-check` with arbitraries for malformed phone numbers (non-10-digit), invalid emails, and out-of-range `player_count`; assert the Zod schema returns a `ZodError` for all invalid inputs and passes for all valid inputs
    - Tag: `Feature: football-tournament-registration, Property 5: Server-side validation rejects invalid payloads`
    - **Validates: Requirements 2.4, 2.5, 2.6, 3.5**

- [x] 19. Frontend — Step 2: Player Details Form
  - Write `src/components/registration/PlayerDetailsStep.tsx`
  - Dynamically render one row per player based on `player_count` from the Zustand store
  - Each row collects `full_name` (non-empty) and `age` (integer 5–60) with inline validation
  - On valid submit: call `submitPlayers` API, advance to step 3
  - Display per-field validation errors without advancing on any missing field (Req 3.3)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 20. Frontend — Step 3: Payment Step
  - Write `src/components/registration/PaymentStep.tsx`
  - Display the organizer's UPI QR code image (with descriptive `alt` text) and UPI ID prominently
  - List accepted UPI apps: Google Pay, PhonePe, Paytm
  - Include `FileUpload` component for payment proof (JPEG/PNG, ≤5 MB); retain `File` object in component state on failure for retry
  - On valid submit: call `uploadPayment` API, advance to step 4
  - Display validation error if user attempts to submit without uploading (Req 4.5)
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 10.5_

- [x] 21. Frontend — Step 4: Confirmation Screen
  - Write `src/components/registration/ConfirmationStep.tsx` and `src/pages/ConfirmationPage.tsx`
  - Display the `registration_id` and current `status` prominently
  - Display a message informing the team manager that the admin will review the payment
  - Include a link to `/status/{registration_id}` for optional status tracking (Req 5.3)
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 22. Frontend — Admin Login Page
  - Write `src/pages/AdminLoginPage.tsx` with email + password form using React Hook Form
  - On valid submit: call `login` API, store JWT via `useAdminAuth`, redirect to `/admin/dashboard`
  - On invalid credentials (401): display an error message without storing a token
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 23. Frontend — Admin Dashboard: Registration Table
  - Write `src/components/admin/RegistrationTable.tsx` with a paginated table showing: team name, manager name, contact details, player count, status (via `StatusBadge`), and registration timestamp
  - Write `src/components/admin/StatusBadge.tsx`: color-coded pill for each `RegistrationStatus` value
  - Add filter controls for `status` (dropdown) and a search input for team/manager name; debounce the search input before firing the API call
  - Wire pagination controls (prev/next, page size selector)
  - _Requirements: 7.1, 7.6, 7.7_

- [x] 24. Frontend — Admin Dashboard: Registration Detail and Actions
  - Write `src/components/admin/RegistrationDetail.tsx` showing full team details, all player records, and the payment proof image rendered inline (using the `/admin/registrations/{id}/payment-proof` endpoint URL as `<img src>`)
  - Add "Approve" and "Reject" buttons that call `updateStatus` and refresh the detail view
  - Write `src/components/admin/ExportButton.tsx` with a dropdown for CSV and XLSX format selection; triggers a file download via the export endpoint URL
  - Write `src/pages/AdminDashboardPage.tsx` composing `RegistrationTable`, `RegistrationDetail`, and `ExportButton`
  - _Requirements: 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

- [x] 25. Frontend — Component Tests
  - Write Vitest + React Testing Library tests for:
    - `TeamDetailsStep`: renders all fields, shows validation errors on empty submit, shows phone format error, shows email format error
    - `PlayerDetailsStep`: renders correct number of rows for a given `player_count`, shows errors on missing fields
    - `PaymentStep`: shows error when submitting without a file, retains file on simulated upload failure
    - `RegistrationTable`: renders rows, filter dropdown changes query params, search input is debounced
    - `ProtectedRoute`: redirects unauthenticated users to `/admin/login`
  - Assert `alt` text presence on QR code and non-decorative images using `axe-core`
  - _Requirements: 2.4, 2.5, 2.6, 3.3, 4.5, 4.6, 7.6, 7.7, 10.4, 10.5_

- [x] 26. Frontend Checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all component and property tests pass. Ask the user if any questions arise before proceeding to final wiring.

- [x] 27. Integration Wiring and Environment Configuration
  - Write `docker-compose.yml` (optional but recommended) with services: `backend` (FastAPI + uvicorn), `frontend` (Vite dev server or nginx static), `db` (PostgreSQL)
  - Write `backend/scripts/init_db.py` that runs `Base.metadata.create_all` and seeds the first admin account using `create_admin.py`
  - Write a root `README.md` documenting: prerequisites, environment variable setup, how to run backend (`uvicorn app.main:app --reload`), how to run frontend (`npm run dev`), how to run tests (`pytest` / `vitest --run`), and how to seed the admin account
  - Verify the full registration wizard flow works end-to-end against the running backend (automated integration test in task 11 covers this)
  - _Requirements: 1.1, 2.3, 3.4, 4.4, 5.1, 6.1, 7.1, 8.1_

- [x] 28. Final Checkpoint — Ensure all tests pass
  - Run `pytest backend/` and `vitest --run` in `frontend/`; confirm zero failures across all unit, property, integration, and component tests. Ask the user if any questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP, but are strongly recommended for correctness guarantees
- Each task references specific requirements for full traceability
- Property tests are placed immediately after the implementation they validate to catch regressions early
- All 11 correctness properties from the design document are covered by property-based tests (tasks 5.1, 6.1, 6.2, 6.3, 7.1, 8.1, 8.2, 9.1, 9.2, 9.3, 10.1) plus the frontend equivalent of Property 5 (task 18.1)
- Backend property tests use **Hypothesis**; frontend property tests use **fast-check**
- The `FileUpload` component's file-retention behavior (Req 4.6) must be implemented before the payment step component test in task 25
