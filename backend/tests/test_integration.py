"""
Integration tests for the Shining Star United Tournament Registration API.
Uses an in-memory SQLite database via pytest-asyncio and httpx.AsyncClient.
"""
import io
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database import Base
from app.dependencies.db import get_db
from app.models import Team, Player, Admin, PaymentProof
from app.services.auth_service import hash_password, create_access_token

# ── Test database setup ──────────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False
)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
async def setup_db():
    """Create tables before each test and drop after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.fixture
async def admin_token():
    """Create an admin and return a valid JWT."""
    async with TestSessionLocal() as session:
        admin = Admin(email="admin@test.com", password_hash=hash_password("secret123"))
        session.add(admin)
        await session.commit()
    return create_access_token({"sub": "admin@test.com"})


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ── Health check ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_check(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# ── Full registration wizard flow ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_full_registration_flow(client, tmp_path):
    # Step 1: Create team
    resp = await client.post("/api/v1/registrations", json={
        "team_name": "Test FC",
        "manager_name": "John Doe",
        "contact_phone": "9876543210",
        "contact_email": "john@example.com",
        "player_count": 11,
    })
    assert resp.status_code == 201
    data = resp.json()
    reg_id = data["registration_id"]
    assert reg_id.startswith("SSU-")
    assert data["status"] == "pending"

    # Step 2: Submit players (now includes jersey_number and position)
    players = [
        {"full_name": f"Player {i}", "age": 20 + i, "jersey_number": i + 1, "position": "Midfielder"}
        for i in range(11)
    ]
    resp = await client.post(f"/api/v1/registrations/{reg_id}/players", json=players)
    assert resp.status_code == 201

    # Step 3: Upload payment proof
    fake_jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 100  # minimal JPEG header
    resp = await client.post(
        f"/api/v1/registrations/{reg_id}/payment",
        files={"file": ("proof.jpg", io.BytesIO(fake_jpeg), "image/jpeg")},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "payment_submitted"

    # Step 4: Check status
    resp = await client.get(f"/api/v1/registrations/{reg_id}/status")
    assert resp.status_code == 200
    assert resp.json()["status"] == "payment_submitted"


# ── Validation errors ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_invalid_phone_rejected(client):
    resp = await client.post("/api/v1/registrations", json={
        "team_name": "Test FC",
        "manager_name": "John",
        "contact_phone": "123",  # invalid
        "contact_email": "john@example.com",
        "player_count": 11,
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_invalid_player_count_rejected(client):
    resp = await client.post("/api/v1/registrations", json={
        "team_name": "Test FC",
        "manager_name": "John",
        "contact_phone": "9876543210",
        "contact_email": "john@example.com",
        "player_count": 5,  # below minimum of 11
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_invalid_email_rejected(client):
    resp = await client.post("/api/v1/registrations", json={
        "team_name": "Test FC",
        "manager_name": "John",
        "contact_phone": "9876543210",
        "contact_email": "not-an-email",
        "player_count": 11,
    })
    assert resp.status_code == 422


# ── File upload validation ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_non_image_payment_proof_rejected(client):
    # Create a team first
    resp = await client.post("/api/v1/registrations", json={
        "team_name": "Test FC", "manager_name": "John",
        "contact_phone": "9876543210", "contact_email": "j@e.com", "player_count": 11,
    })
    reg_id = resp.json()["registration_id"]

    resp = await client.post(
        f"/api/v1/registrations/{reg_id}/payment",
        files={"file": ("doc.pdf", io.BytesIO(b"fake pdf"), "application/pdf")},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_png_payment_proof_accepted(client):
    resp = await client.post("/api/v1/registrations", json={
        "team_name": "PNG FC", "manager_name": "Jane",
        "contact_phone": "9876543211", "contact_email": "jane@e.com", "player_count": 11,
    })
    reg_id = resp.json()["registration_id"]

    fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    resp = await client.post(
        f"/api/v1/registrations/{reg_id}/payment",
        files={"file": ("proof.png", io.BytesIO(fake_png), "image/png")},
    )
    assert resp.status_code == 200


# ── Admin auth ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_login_success(client):
    async with TestSessionLocal() as session:
        admin = Admin(email="a@b.com", password_hash=hash_password("pass"))
        session.add(admin)
        await session.commit()

    resp = await client.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "pass"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_admin_login_wrong_password(client):
    async with TestSessionLocal() as session:
        admin = Admin(email="a@b.com", password_hash=hash_password("correct"))
        session.add(admin)
        await session.commit()

    resp = await client.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "wrong"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_admin_endpoint_requires_auth(client):
    resp = await client.get("/api/v1/admin/registrations")
    assert resp.status_code in (401, 403)


# ── Admin dashboard ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_list_registrations(client, auth_headers):
    # Create two teams
    for i in range(2):
        await client.post("/api/v1/registrations", json={
            "team_name": f"Team {i}", "manager_name": f"Manager {i}",
            "contact_phone": f"987654321{i}", "contact_email": f"m{i}@e.com",
            "player_count": 11,
        })

    resp = await client.get("/api/v1/admin/registrations", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_admin_approve_team(client, auth_headers):
    # Create team and upload payment
    resp = await client.post("/api/v1/registrations", json={
        "team_name": "Approve FC", "manager_name": "Bob",
        "contact_phone": "9876543210", "contact_email": "bob@e.com", "player_count": 11,
    })
    reg_id = resp.json()["registration_id"]

    fake_jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 100
    await client.post(
        f"/api/v1/registrations/{reg_id}/payment",
        files={"file": ("p.jpg", io.BytesIO(fake_jpeg), "image/jpeg")},
    )

    resp = await client.patch(
        f"/api/v1/admin/registrations/{reg_id}/status",
        json={"status": "approved"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"


@pytest.mark.asyncio
async def test_admin_reject_team(client, auth_headers):
    resp = await client.post("/api/v1/registrations", json={
        "team_name": "Reject FC", "manager_name": "Alice",
        "contact_phone": "9876543210", "contact_email": "alice@e.com", "player_count": 11,
    })
    reg_id = resp.json()["registration_id"]

    fake_jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 100
    await client.post(
        f"/api/v1/registrations/{reg_id}/payment",
        files={"file": ("p.jpg", io.BytesIO(fake_jpeg), "image/jpeg")},
    )

    resp = await client.patch(
        f"/api/v1/admin/registrations/{reg_id}/status",
        json={"status": "rejected"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"


@pytest.mark.asyncio
async def test_admin_filter_by_status(client, auth_headers):
    # Create two teams, approve one
    for i in range(2):
        r = await client.post("/api/v1/registrations", json={
            "team_name": f"Filter {i}", "manager_name": f"M{i}",
            "contact_phone": f"987654321{i}", "contact_email": f"f{i}@e.com", "player_count": 11,
        })
        reg_id = r.json()["registration_id"]
        if i == 0:
            fake_jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 100
            await client.post(
                f"/api/v1/registrations/{reg_id}/payment",
                files={"file": ("p.jpg", io.BytesIO(fake_jpeg), "image/jpeg")},
            )
            await client.patch(
                f"/api/v1/admin/registrations/{reg_id}/status",
                json={"status": "approved"}, headers=auth_headers,
            )

    resp = await client.get(
        "/api/v1/admin/registrations?status=approved", headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == "approved"


@pytest.mark.asyncio
async def test_admin_search(client, auth_headers):
    await client.post("/api/v1/registrations", json={
        "team_name": "Lions FC", "manager_name": "Carlos",
        "contact_phone": "9876543210", "contact_email": "c@e.com", "player_count": 11,
    })
    await client.post("/api/v1/registrations", json={
        "team_name": "Tigers FC", "manager_name": "David",
        "contact_phone": "9876543211", "contact_email": "d@e.com", "player_count": 11,
    })

    resp = await client.get(
        "/api/v1/admin/registrations?search=lions", headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["team_name"] == "Lions FC"


@pytest.mark.asyncio
async def test_export_csv(client, auth_headers):
    await client.post("/api/v1/registrations", json={
        "team_name": "Export FC", "manager_name": "Eve",
        "contact_phone": "9876543210", "contact_email": "e@e.com", "player_count": 11,
    })

    resp = await client.get(
        "/api/v1/admin/export?format=csv", headers=auth_headers
    )
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert "Export FC" in resp.text

# ── Tournament Management Tests ───────────────────────────────────────────────

from app.models.match import Match
from app.models.standing import Standing
import uuid
from datetime import datetime, timezone


@pytest.fixture
async def two_teams(client, auth_headers):
    """Create two approved teams and return their IDs."""
    team_ids = []
    for i in range(2):
        resp = await client.post("/api/v1/registrations", json={
            "team_name": f"Team {i+1}",
            "manager_name": f"Manager {i+1}",
            "contact_phone": f"987654321{i}",
            "contact_email": f"team{i+1}@test.com",
            "player_count": 11,
        })
        assert resp.status_code == 201
        reg_id = resp.json()["registration_id"]

        # Approve the team
        await client.patch(
            f"/api/v1/admin/registrations/{reg_id}/status",
            json={"status": "approved"},
            headers=auth_headers,
        )

        # Get team UUID
        detail = await client.get(
            f"/api/v1/admin/registrations/{reg_id}",
            headers=auth_headers,
        )
        team_ids.append(detail.json()["id"])

    return team_ids


@pytest.mark.asyncio
async def test_full_match_lifecycle(client, auth_headers, two_teams):
    """Full lifecycle: create fixture → update score (live) → mark completed → verify standings."""
    team_a_id, team_b_id = two_teams

    # Step 1: Create fixture
    resp = await client.post("/api/v1/matches", json={
        "team_a_id": team_a_id,
        "team_b_id": team_b_id,
        "scheduled_at": "2025-06-15T10:00:00",
        "venue": "Rongbong Ronghang Playground",
        "round": "Quarter-Final",
    }, headers=auth_headers)
    assert resp.status_code == 201
    match_id = resp.json()["id"]
    assert resp.json()["status"] == "scheduled"

    # Step 2: Update score (set to live)
    resp = await client.patch(f"/api/v1/matches/{match_id}/score", json={
        "team_a_score": 2,
        "team_b_score": 1,
        "status": "live",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "live"
    assert resp.json()["team_a_score"] == 2

    # Step 3: Mark completed
    resp = await client.patch(f"/api/v1/matches/{match_id}/score", json={
        "team_a_score": 2,
        "team_b_score": 1,
        "status": "completed",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"

    # Step 4: Verify standings
    resp = await client.get("/api/v1/standings")
    assert resp.status_code == 200
    standings = resp.json()
    assert len(standings) == 2

    # Team A won 2-1: 3 points, 1 win
    team_a_standing = next(s for s in standings if s["team_id"] == team_a_id)
    assert team_a_standing["points"] == 3
    assert team_a_standing["wins"] == 1
    assert team_a_standing["losses"] == 0
    assert team_a_standing["goals_scored"] == 2
    assert team_a_standing["goals_conceded"] == 1
    assert team_a_standing["goal_difference"] == 1

    # Team B lost 1-2: 0 points, 1 loss
    team_b_standing = next(s for s in standings if s["team_id"] == team_b_id)
    assert team_b_standing["points"] == 0
    assert team_b_standing["wins"] == 0
    assert team_b_standing["losses"] == 1
    assert team_b_standing["goals_scored"] == 1
    assert team_b_standing["goals_conceded"] == 2
    assert team_b_standing["goal_difference"] == -1


@pytest.mark.asyncio
async def test_public_matches_endpoint_no_auth(client, auth_headers, two_teams):
    """Public endpoints return 200 without auth headers."""
    team_a_id, team_b_id = two_teams

    # Create a fixture
    await client.post("/api/v1/matches", json={
        "team_a_id": team_a_id,
        "team_b_id": team_b_id,
        "scheduled_at": "2025-06-15T10:00:00",
        "venue": "Test Venue",
        "round": "Semi-Final",
    }, headers=auth_headers)

    # Access without auth
    resp = await client.get("/api/v1/matches")
    assert resp.status_code == 200

    resp = await client.get("/api/v1/standings")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_same_team_fixture_rejected(client, auth_headers, two_teams):
    """Creating a fixture with the same team for both slots returns 422."""
    team_a_id = two_teams[0]
    resp = await client.post("/api/v1/matches", json={
        "team_a_id": team_a_id,
        "team_b_id": team_a_id,
        "scheduled_at": "2025-06-15T10:00:00",
        "venue": "Test Venue",
        "round": "Final",
    }, headers=auth_headers)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_score_update_on_completed_match_rejected(client, auth_headers, two_teams):
    """Score update on a completed match returns 409."""
    team_a_id, team_b_id = two_teams

    resp = await client.post("/api/v1/matches", json={
        "team_a_id": team_a_id,
        "team_b_id": team_b_id,
        "scheduled_at": "2025-06-15T10:00:00",
        "venue": "Test Venue",
        "round": "Final",
    }, headers=auth_headers)
    match_id = resp.json()["id"]

    # Complete the match
    await client.patch(f"/api/v1/matches/{match_id}/score", json={
        "team_a_score": 1,
        "team_b_score": 0,
        "status": "completed",
    }, headers=auth_headers)

    # Try to update score again
    resp = await client.patch(f"/api/v1/matches/{match_id}/score", json={
        "team_a_score": 3,
        "team_b_score": 0,
    }, headers=auth_headers)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_leaderboard_ordering(client, auth_headers, two_teams):
    """Leaderboard is ordered by points descending."""
    team_a_id, team_b_id = two_teams

    resp = await client.post("/api/v1/matches", json={
        "team_a_id": team_a_id,
        "team_b_id": team_b_id,
        "scheduled_at": "2025-06-15T10:00:00",
        "venue": "Test Venue",
        "round": "Final",
    }, headers=auth_headers)
    match_id = resp.json()["id"]

    await client.patch(f"/api/v1/matches/{match_id}/score", json={
        "team_a_score": 3,
        "team_b_score": 0,
        "status": "completed",
    }, headers=auth_headers)

    resp = await client.get("/api/v1/standings")
    standings = resp.json()
    # First team should have more points
    assert standings[0]["points"] >= standings[1]["points"]
    assert standings[0]["team_id"] == team_a_id
