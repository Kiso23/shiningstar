#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# Production Setup Script — Shining Star United
# Automates the production environment setup
# Usage: ./setup-production.sh
# ══════════════════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${BLUE}${BOLD}🚀 Production Setup — Shining Star United${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# ── Step 1: Check prerequisites ────────────────────────────────────────────────
echo -e "${BLUE}[1/8]${NC} Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo -e "  ${RED}✗${NC} Python 3 not found"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "  ${RED}✗${NC} Node.js not found"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo -e "  ${YELLOW}⚠${NC} PostgreSQL client not found (optional for SQLite)"
else
    echo -e "  ${GREEN}✓${NC} PostgreSQL client found"
fi

echo -e "  ${GREEN}✓${NC} Prerequisites OK"

# ── Step 2: Generate secure credentials ────────────────────────────────────────
echo ""
echo -e "${BLUE}[2/8]${NC} Generating secure credentials..."

SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(24))")
ADMIN_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(16))")

echo -e "  ${GREEN}✓${NC} Generated SECRET_KEY (64 chars)"
echo -e "  ${GREEN}✓${NC} Generated DB_PASSWORD (32 chars)"
echo -e "  ${GREEN}✓${NC} Generated ADMIN_PASSWORD (22 chars)"

# ── Step 3: Prompt for configuration ────────────────────────────────────────────
echo ""
echo -e "${BLUE}[3/8]${NC} Configuration..."

# Ask for domain
echo -e "${ORANGE}Enter your production domain (e.g., tournament.example.com):${NC}"
read -p "Domain [localhost]: " DOMAIN
DOMAIN=${DOMAIN:-localhost}

# Ask for admin email
echo -e "${ORANGE}Enter admin email:${NC}"
read -p "Email [admin@${DOMAIN}]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@${DOMAIN}}

# Ask for database type
echo -e "${ORANGE}Choose database:${NC}"
echo "  1) SQLite (development/testing)"
echo "  2) PostgreSQL (production)"
read -p "Choice [1]: " DB_CHOICE
DB_CHOICE=${DB_CHOICE:-1}

if [ "$DB_CHOICE" = "2" ]; then
    DATABASE_URL="postgresql+asyncpg://ssu:${DB_PASSWORD}@localhost:5432/ssu_tournament"
    echo -e "  ${GREEN}✓${NC} Using PostgreSQL"
else
    DATABASE_URL="sqlite+aiosqlite:///./production.db"
    echo -e "  ${GREEN}✓${NC} Using SQLite"
fi

# Ask for SMTP configuration
echo -e "${ORANGE}Configure email notifications?${NC}"
read -p "Enable email? [y/N]: " ENABLE_EMAIL
ENABLE_EMAIL=${ENABLE_EMAIL:-n}

if [[ "$ENABLE_EMAIL" =~ ^[Yy]$ ]]; then
    echo -e "${ORANGE}Enter SMTP host (e.g., smtp.gmail.com):${NC}"
    read -p "SMTP Host: " SMTP_HOST
    
    echo -e "${ORANGE}Enter SMTP port:${NC}"
    read -p "SMTP Port [587]: " SMTP_PORT
    SMTP_PORT=${SMTP_PORT:-587}
    
    echo -e "${ORANGE}Enter SMTP username (email):${NC}"
    read -p "SMTP User: " SMTP_USER
    
    echo -e "${ORANGE}Enter SMTP password (app password for Gmail):${NC}"
    read -sp "SMTP Password: " SMTP_PASSWORD
    echo ""
    
    SMTP_FROM=${SMTP_USER%%@*}
else
    SMTP_HOST=""
    SMTP_PORT="587"
    SMTP_USER=""
    SMTP_PASSWORD=""
    SMTP_FROM="noreply"
fi

# ── Step 4: Create production .env file ────────────────────────────────────────
echo ""
echo -e "${BLUE}[4/8]${NC} Creating production environment file..."

cat > backend/.env.production << EOF
# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTION environment — backend/.env.production
# Generated: $(date)
# ══════════════════════════════════════════════════════════════════════════════

# ── Database ───────────────────────────────────────────────────────────────────
DATABASE_URL=${DATABASE_URL}

# ── Auth ───────────────────────────────────────────────────────────────────────
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ── File uploads ───────────────────────────────────────────────────────────────
UPLOAD_DIR=./uploads

# ── CORS ───────────────────────────────────────────────────────────────────────
CORS_ORIGINS=["https://${DOMAIN}","http://localhost:4173"]

# ── SMTP Email ─────────────────────────────────────────────────────────────────
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_TLS=true
SMTP_USER=${SMTP_USER}
SMTP_PASSWORD=${SMTP_PASSWORD}
SMTP_FROM=${SMTP_FROM}
EOF

chmod 600 backend/.env.production
echo -e "  ${GREEN}✓${NC} Created backend/.env.production"

# ── Step 5: Setup backend ───────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[5/8]${NC} Setting up backend..."

if [ ! -d "backend/.venv" ]; then
    echo -e "  ${ORANGE}Creating virtual environment...${NC}"
    python3 -m venv backend/.venv
fi

echo -e "  ${ORANGE}Installing dependencies...${NC}"
backend/.venv/bin/pip install -q -r backend/requirements.txt

echo -e "  ${GREEN}✓${NC} Backend setup complete"

# ── Step 6: Setup database ──────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[6/8]${NC} Setting up database..."

if [ "$DB_CHOICE" = "2" ]; then
    echo -e "  ${ORANGE}PostgreSQL setup required:${NC}"
    echo ""
    echo -e "  Run these commands as postgres user:"
    echo -e "  ${BLUE}sudo -u postgres psql${NC}"
    echo -e "  ${BLUE}CREATE DATABASE ssu_tournament;${NC}"
    echo -e "  ${BLUE}CREATE USER ssu WITH PASSWORD '${DB_PASSWORD}';${NC}"
    echo -e "  ${BLUE}GRANT ALL PRIVILEGES ON DATABASE ssu_tournament TO ssu;${NC}"
    echo -e "  ${BLUE}\\q${NC}"
    echo ""
    read -p "Press Enter when database is ready..."
fi

# Copy production env to .env for initialization
cp backend/.env.production backend/.env

echo -e "  ${ORANGE}Initializing database tables...${NC}"
cd backend
.venv/bin/python -m scripts.init_db
cd ..

echo -e "  ${GREEN}✓${NC} Database initialized"

# ── Step 7: Create admin account ────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[7/8]${NC} Creating admin account..."

cd backend
.venv/bin/python -m scripts.create_admin \
    --email "${ADMIN_EMAIL}" \
    --password "${ADMIN_PASSWORD}"
cd ..

echo -e "  ${GREEN}✓${NC} Admin account created"

# ── Step 8: Setup frontend ──────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[8/8]${NC} Setting up frontend..."

if [ ! -d "frontend/node_modules" ]; then
    echo -e "  ${ORANGE}Installing dependencies...${NC}"
    cd frontend
    npm install --silent
    cd ..
fi

echo -e "  ${ORANGE}Building production bundle...${NC}"
cd frontend
npm run build > /dev/null 2>&1
cd ..

echo -e "  ${GREEN}✓${NC} Frontend built"

# ── Summary ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}✓ Production setup complete!${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo -e "  Domain:        ${DOMAIN}"
echo -e "  Database:      $([ "$DB_CHOICE" = "2" ] && echo "PostgreSQL" || echo "SQLite")"
echo -e "  Admin Email:   ${ADMIN_EMAIL}"
echo -e "  Admin Pass:    ${ADMIN_PASSWORD}"
echo ""
echo -e "${ORANGE}${BOLD}⚠️  IMPORTANT: Save these credentials securely!${NC}"
echo ""
echo -e "${BLUE}Credentials saved to:${NC}"
echo -e "  backend/.env.production (chmod 600)"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Start the application:"
echo -e "     ${BOLD}./prod.sh${NC}"
echo ""
echo -e "  2. Access the application:"
echo -e "     Frontend:  http://localhost:4173"
echo -e "     Backend:   http://localhost:8000"
echo -e "     API Docs:  http://localhost:8000/docs"
echo ""
echo -e "  3. Login to admin dashboard:"
echo -e "     Email:     ${ADMIN_EMAIL}"
echo -e "     Password:  ${ADMIN_PASSWORD}"
echo ""
echo -e "  4. For production deployment with HTTPS:"
echo -e "     See ${BOLD}DEPLOYMENT.md${NC}"
echo ""
echo -e "${ORANGE}Run security audit before deploying:${NC}"
echo -e "  ${BOLD}./security-audit.sh${NC}"
echo ""
