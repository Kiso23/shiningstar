#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# Quick Setup Script — Shining Star United
# Automated setup for development or local production testing
# Usage: ./quick-setup.sh [dev|prod]
# ══════════════════════════════════════════════════════════════════════════════

set -e

MODE=${1:-dev}

GREEN='\033[0;32m'
BLUE='\033[0;34m'
ORANGE='\033[0;33m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${BLUE}${BOLD}⚡ Quick Setup — Shining Star United${NC}"
echo -e "${BLUE}Mode: ${MODE}${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# ── Backend Setup ───────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/5]${NC} Setting up backend..."

if [ ! -d "backend/.venv" ]; then
    echo -e "  ${ORANGE}Creating virtual environment...${NC}"
    python3 -m venv backend/.venv
fi

echo -e "  ${ORANGE}Installing dependencies...${NC}"
backend/.venv/bin/pip install -q -r backend/requirements.txt

if [ ! -f "backend/.env" ] || [ "$MODE" = "dev" ]; then
    echo -e "  ${ORANGE}Creating development .env file...${NC}"
    cat > backend/.env << EOF
# ══════════════════════════════════════════════════════════════════════════════
# DEVELOPMENT environment — backend/.env
# Used by: ./dev.sh  |  uvicorn --reload
# ══════════════════════════════════════════════════════════════════════════════

# ── Database (SQLite for dev — fast, no setup needed) ─────────────────────────
DATABASE_URL=sqlite+aiosqlite:///./dev.db

# ── Auth (secure random key — DO NOT reuse in production) ─────────────────────
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ── File uploads ───────────────────────────────────────────────────────────────
UPLOAD_DIR=./uploads

# ── CORS (allow Vite dev server) ───────────────────────────────────────────────
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]

# ── SMTP Email (optional for development) ──────────────────────────────────────
SMTP_HOST=
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply
EOF
fi

echo -e "  ${GREEN}✓${NC} Backend ready"

# ── Database Setup ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[2/5]${NC} Setting up database..."

cd backend
.venv/bin/python -m scripts.init_db
cd ..

echo -e "  ${GREEN}✓${NC} Database initialized"

# ── Admin Account ───────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[3/5]${NC} Creating admin account..."

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

cd backend
.venv/bin/python -m scripts.create_admin \
    --email "${ADMIN_EMAIL}" \
    --password "${ADMIN_PASSWORD}" 2>/dev/null || echo "  Admin already exists"
cd ..

echo -e "  ${GREEN}✓${NC} Admin account ready"
echo -e "     Email: ${ADMIN_EMAIL}"
echo -e "     Password: ${ADMIN_PASSWORD}"

# ── Frontend Setup ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[4/5]${NC} Setting up frontend..."

if [ ! -d "frontend/node_modules" ]; then
    echo -e "  ${ORANGE}Installing dependencies...${NC}"
    cd frontend
    npm install --silent
    cd ..
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "  ${ORANGE}Creating .env file...${NC}"
    echo "VITE_API_BASE_URL=/api/v1" > frontend/.env
fi

if [ "$MODE" = "prod" ]; then
    echo -e "  ${ORANGE}Building production bundle...${NC}"
    cd frontend
    npm run build > /dev/null 2>&1
    cd ..
fi

echo -e "  ${GREEN}✓${NC} Frontend ready"

# ── Upload Directories ──────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[5/5]${NC} Creating upload directories..."

mkdir -p backend/uploads/logos backend/uploads/payment_proofs
chmod 755 backend/uploads

echo -e "  ${GREEN}✓${NC} Upload directories ready"

# ── Summary ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}✓ Setup complete!${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════${NC}"
echo ""

if [ "$MODE" = "dev" ]; then
    echo -e "${BLUE}Start development servers:${NC}"
    echo -e "  ${BOLD}./dev.sh${NC}"
    echo ""
    echo -e "${BLUE}Access:${NC}"
    echo -e "  Frontend:  http://localhost:5173"
    echo -e "  Backend:   http://localhost:8000"
    echo -e "  API Docs:  http://localhost:8000/docs"
else
    echo -e "${BLUE}Start production servers:${NC}"
    echo -e "  ${BOLD}./prod.sh${NC}"
    echo ""
    echo -e "${BLUE}Access:${NC}"
    echo -e "  Frontend:  http://localhost:4173"
    echo -e "  Backend:   http://localhost:8000"
    echo -e "  API Docs:  http://localhost:8000/docs"
fi

echo ""
echo -e "${BLUE}Admin Login:${NC}"
echo -e "  Email:     ${ADMIN_EMAIL}"
echo -e "  Password:  ${ADMIN_PASSWORD}"
echo ""
echo -e "${ORANGE}⚠️  Change the admin password in production!${NC}"
echo ""
