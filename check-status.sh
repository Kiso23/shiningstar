#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# Status Check Script — Shining Star United
# Checks if all services are running correctly
# Usage: ./check-status.sh
# ══════════════════════════════════════════════════════════════════════════════

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
ORANGE='\033[0;33m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${BLUE}${BOLD}🔍 Status Check — Shining Star United${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# ── Backend Health Check ────────────────────────────────────────────────────────
echo -e "${BLUE}[1/4]${NC} Checking backend..."

if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:8000/health)
    if echo "$HEALTH" | grep -q '"status":"ok"'; then
        echo -e "  ${GREEN}✓${NC} Backend is running (http://localhost:8000)"
        echo -e "  ${GREEN}✓${NC} Health check: OK"
    else
        echo -e "  ${ORANGE}⚠${NC} Backend is running but health check failed"
    fi
else
    echo -e "  ${RED}✗${NC} Backend is not running"
    echo -e "     Start with: ${BOLD}./dev.sh${NC} or ${BOLD}./prod.sh${NC}"
fi

# ── Frontend Check ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[2/4]${NC} Checking frontend..."

# Check dev server (port 5173)
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Frontend dev server is running (http://localhost:5173)"
elif curl -s http://localhost:4173 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Frontend production server is running (http://localhost:4173)"
else
    echo -e "  ${RED}✗${NC} Frontend is not running"
    echo -e "     Start with: ${BOLD}./dev.sh${NC} or ${BOLD}./prod.sh${NC}"
fi

# ── Database Check ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[3/4]${NC} Checking database..."

if [ -f "backend/.env" ]; then
    DB_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d'=' -f2)
    
    if echo "$DB_URL" | grep -q "sqlite"; then
        if [ -f "backend/dev.db" ]; then
            echo -e "  ${GREEN}✓${NC} SQLite database exists (backend/dev.db)"
        else
            echo -e "  ${ORANGE}⚠${NC} SQLite database not found"
            echo -e "     Initialize with: ${BOLD}cd backend && python -m scripts.init_db${NC}"
        fi
    elif echo "$DB_URL" | grep -q "postgresql"; then
        echo -e "  ${BLUE}ℹ${NC} PostgreSQL configured"
        # Try to connect (requires psql)
        if command -v psql &> /dev/null; then
            if psql "$DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
                echo -e "  ${GREEN}✓${NC} PostgreSQL connection successful"
            else
                echo -e "  ${RED}✗${NC} Cannot connect to PostgreSQL"
            fi
        else
            echo -e "  ${ORANGE}⚠${NC} psql not available, cannot test connection"
        fi
    fi
else
    echo -e "  ${RED}✗${NC} backend/.env not found"
    echo -e "     Run: ${BOLD}./quick-setup.sh dev${NC}"
fi

# ── API Documentation ───────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[4/4]${NC} Checking API documentation..."

if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} API docs available (http://localhost:8000/docs)"
else
    echo -e "  ${RED}✗${NC} API docs not accessible"
fi

# ── Summary ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Count running services
RUNNING=0
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    RUNNING=$((RUNNING + 1))
fi
if curl -s http://localhost:5173 > /dev/null 2>&1 || curl -s http://localhost:4173 > /dev/null 2>&1; then
    RUNNING=$((RUNNING + 1))
fi

if [ $RUNNING -eq 2 ]; then
    echo -e "${GREEN}${BOLD}✓ All services running!${NC}"
    echo ""
    echo -e "${BLUE}Access:${NC}"
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "  Frontend:  http://localhost:5173"
    else
        echo -e "  Frontend:  http://localhost:4173"
    fi
    echo -e "  Backend:   http://localhost:8000"
    echo -e "  API Docs:  http://localhost:8000/docs"
    echo ""
    echo -e "${BLUE}Admin Login:${NC}"
    echo -e "  Email:     admin@example.com"
    echo -e "  Password:  admin123"
elif [ $RUNNING -eq 1 ]; then
    echo -e "${ORANGE}${BOLD}⚠ Some services not running${NC}"
    echo -e "  Start all services with: ${BOLD}./dev.sh${NC} or ${BOLD}./prod.sh${NC}"
else
    echo -e "${RED}${BOLD}✗ No services running${NC}"
    echo -e "  Start with: ${BOLD}./quick-setup.sh dev && ./dev.sh${NC}"
fi

echo ""
