# ⚽ Shining Star United — Football Tournament Registration

A full-stack web application for managing football tournament registrations. Teams register, submit player details, pay via UPI, and admins manage everything through a secure dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Backend | FastAPI (Python 3.12) |
| Auth | JWT (python-jose + passlib/bcrypt) |
| ORM | SQLAlchemy 2 (async) |
| DB (dev) | SQLite (aiosqlite) |
| DB (prod) | PostgreSQL (asyncpg) |
| Containers | Docker + Docker Compose |

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Complete production deployment guide
- **[SECURITY-SUMMARY.md](SECURITY-SUMMARY.md)** — Security audit results and action items
- **[PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md)** — Pre-deployment checklist
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** — Command reference and troubleshooting
- **[API Documentation](http://localhost:8000/docs)** — Interactive API docs (when running)

---

## ⚡ Quick Setup

The fastest way to get started:

```bash
# Automated setup (development mode)
./quick-setup.sh dev

# Start development servers
./dev.sh
```

Or for production testing:

```bash
# Automated setup (production mode)
./quick-setup.sh prod

# Start production servers
./prod.sh
```

---

## Quick Start — Development Mode

The easiest way to run everything locally:

```bash
# Start both backend + frontend with one command
./dev.sh

# Stop everything
./stop.sh
```

## Production Mode (Local / VPS)

Builds the frontend and runs the backend with gunicorn (multi-worker):

```bash
# 1. Set a real SECRET_KEY first
# Generate: python3 -c "import secrets; print(secrets.token_hex(32))"
# Edit backend/.env and set SECRET_KEY=<generated value>

# 2. Start production servers
./prod.sh

# Optional: set number of workers (default: 2)
WORKERS=4 ./prod.sh

# Stop
./stop.sh
```

**Differences from dev mode:**
| | Dev | Production |
|--|-----|-----------|
| Frontend | Vite HMR dev server | Built static bundle (Vite preview) |
| Backend | uvicorn --reload | gunicorn + uvicorn workers |
| Workers | 1 | 2 (configurable via `WORKERS=N`) |
| Hot reload | ✅ | ❌ |
| Build step | ❌ | ✅ |

```bash
# 1. Copy and fill in required secrets
cp .env.example .env
# Edit .env — set SECRET_KEY and POSTGRES_PASSWORD

# 2. Build and start all services
docker-compose up --build -d

# 3. Create the first admin account
docker-compose exec backend python -m scripts.create_admin \
  --email admin@example.com --password yourpassword

# 4. Open the app
open http://localhost        # Frontend
open http://localhost:8000/docs  # API docs (Swagger)
```

### Generate a secure SECRET_KEY

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Local Development

### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env — set SECRET_KEY to a long random string

# Initialize database and create admin
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret python -m scripts.init_db

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start dev server
npm run dev
```

Frontend available at: http://localhost:5173

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./dev.db` | Database connection string |
| `SECRET_KEY` | **required** | JWT signing secret (use a long random string) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT expiry (24 hours) |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded files |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api/v1` | Backend API base URL |

---

## 🛠️ Utility Scripts

| Script | Purpose |
|--------|---------|
| `./quick-setup.sh [dev\|prod]` | Automated setup for development or production |
| `./setup-production.sh` | Interactive production setup with credential generation |
| `./security-audit.sh` | Check for security issues before deployment |
| `./check-status.sh` | Check if all services are running |
| `./dev.sh` | Start development servers with hot reload |
| `./prod.sh` | Start production servers with gunicorn |
| `./stop.sh` | Stop all running servers |

---

## Running Tests

### Backend

```bash
cd backend
pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm run test
```

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app factory
│   │   ├── config.py            # Settings (pydantic-settings)
│   │   ├── database.py          # Async SQLAlchemy engine
│   │   ├── models/              # ORM models (Team, Player, Admin, PaymentProof)
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API routers (auth, registrations, admin)
│   │   ├── services/            # Business logic
│   │   ├── dependencies/        # FastAPI dependencies (auth, db)
│   │   └── utils/               # File storage, sanitization
│   ├── scripts/
│   │   ├── create_admin.py      # CLI: create admin account
│   │   └── init_db.py           # CLI: initialize database
│   ├── tests/
│   │   └── test_integration.py  # Integration tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/               # HomePage, RegisterPage, ConfirmationPage, Admin pages
│   │   ├── components/
│   │   │   ├── registration/    # Multi-step wizard components
│   │   │   ├── admin/           # Dashboard components
│   │   │   └── shared/          # ProtectedRoute, FileUpload
│   │   ├── api/                 # Axios API clients
│   │   ├── store/               # Zustand stores
│   │   └── hooks/               # Custom React hooks
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/registrations` | Create team registration |
| `POST` | `/api/v1/registrations/{id}/players` | Submit player roster |
| `POST` | `/api/v1/registrations/{id}/payment` | Upload payment proof |
| `GET`  | `/api/v1/registrations/{id}/status` | Get registration status |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/login` | Admin login → JWT |

### Admin (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/v1/admin/registrations` | List all (paginated, filterable) |
| `GET`  | `/api/v1/admin/registrations/{id}` | Full team detail |
| `PATCH`| `/api/v1/admin/registrations/{id}/status` | Approve / Reject |
| `GET`  | `/api/v1/admin/registrations/{id}/payment-proof` | View payment image |
| `GET`  | `/api/v1/admin/export?format=csv\|xlsx` | Export data |

---

## Registration Flow

```
Team Details → Player Roster → UPI Payment → Confirmation
   (Step 1)       (Step 2)       (Step 3)      (Step 4)
```

**Status lifecycle:** `pending` → `payment_submitted` → `approved` | `rejected`

---

## Security

- Admin passwords hashed with bcrypt (passlib)
- JWT tokens expire after 24 hours
- All admin endpoints require valid Bearer token
- File uploads validated by MIME type and size
- User inputs sanitized (HTML stripped, entities escaped)
- SQLAlchemy parameterized queries prevent SQL injection
- CORS configured to allowed origins only
