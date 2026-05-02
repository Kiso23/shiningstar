#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Shining Star United — Docker Deployment Script
# Builds and deploys the application using Docker Compose
# Usage: ./deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

# Use sudo if not in docker group
DOCKER_CMD="docker"
COMPOSE_CMD="docker-compose"
if ! docker ps &> /dev/null; then
    if sudo docker ps &> /dev/null; then
        DOCKER_CMD="sudo docker"
        COMPOSE_CMD="sudo docker-compose"
        echo -e "${ORANGE}Note: Using sudo for Docker commands${NC}"
    else
        echo -e "${RED}✗ Cannot access Docker. Try: sudo usermod -aG docker $USER${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${ORANGE}${BOLD}⚽  Shining Star United — Docker Deployment${NC}"
echo -e "${ORANGE}═══════════════════════════════════════════════${NC}"
echo ""

# ── Check prerequisites ────────────────────────────────────────────────────
echo -e "${BLUE}▶ Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "${ORANGE}  Create .env file with required variables${NC}"
    exit 1
fi

echo -e "${GREEN}  ✓ Docker and Docker Compose installed${NC}"
echo -e "${GREEN}  ✓ .env file found${NC}"

# ── Stop existing containers ───────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Stopping existing containers...${NC}"
$COMPOSE_CMD down 2>/dev/null || true
echo -e "${GREEN}  ✓ Stopped${NC}"

# ── Build images ───────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Building Docker images...${NC}"
$COMPOSE_CMD build --no-cache
echo -e "${GREEN}  ✓ Images built${NC}"

# ── Start services ─────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Starting services...${NC}"
$COMPOSE_CMD up -d
echo -e "${GREEN}  ✓ Services started${NC}"

# ── Wait for database ──────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Waiting for database to be ready...${NC}"
for i in {1..30}; do
    if $COMPOSE_CMD exec -T db pg_isready -U ssu &> /dev/null; then
        echo -e "${GREEN}  ✓ Database is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Database failed to start${NC}"
        $COMPOSE_CMD logs db
        exit 1
    fi
    sleep 1
done

# ── Initialize database ────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Initializing database...${NC}"
$COMPOSE_CMD exec -T backend python -m scripts.init_db
echo -e "${GREEN}  ✓ Database initialized${NC}"

# ── Create admin account ───────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Creating admin account...${NC}"
$COMPOSE_CMD exec -T backend python -m scripts.create_admin \
    --email admin@shiningstarunited.com \
    --password Shiningstar@1234 2>/dev/null || echo -e "${ORANGE}  Admin already exists${NC}"
echo -e "${GREEN}  ✓ Admin account ready${NC}"

# ── Show status ────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}✓ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
$COMPOSE_CMD ps
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo -e "  ${BOLD}Frontend:${NC}  http://localhost"
echo -e "  ${BOLD}Backend:${NC}   http://localhost/api/v1"
echo -e "  ${BOLD}API Docs:${NC}  http://localhost/api/v1/docs"
echo ""
echo -e "${BLUE}Admin credentials:${NC}"
echo -e "  ${BOLD}Email:${NC}     admin@shiningstarunited.com"
echo -e "  ${BOLD}Password:${NC}  Shiningstar@1234"
echo ""
echo -e "${ORANGE}Useful commands:${NC}"
echo -e "  View logs:        ${BOLD}${COMPOSE_CMD} logs -f${NC}"
echo -e "  Stop services:    ${BOLD}${COMPOSE_CMD} down${NC}"
echo -e "  Restart services: ${BOLD}${COMPOSE_CMD} restart${NC}"
echo -e "  View status:      ${BOLD}${COMPOSE_CMD} ps${NC}"
echo ""
