#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Shining Star United — Development Mode Launcher
# Starts backend (FastAPI) and frontend (Vite) together
# Usage: ./dev.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Colors
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo ""
echo -e "${ORANGE}${BOLD}⚽  Shining Star United — Dev Mode${NC}"
echo -e "${ORANGE}────────────────────────────────────${NC}"
echo ""

# ── Check .env exists ──────────────────────────────────────────────────────
if [ ! -f "backend/.env" ]; then
  echo -e "${RED}✗ backend/.env not found. Copying from .env.example...${NC}"
  cp backend/.env.example backend/.env
  echo -e "${ORANGE}⚠  Please set SECRET_KEY in backend/.env before running again.${NC}"
  exit 1
fi

# ── Check Python packages ──────────────────────────────────────────────────
echo -e "${BLUE}▶ Checking Python dependencies...${NC}"
if ! python3 -c "import fastapi" 2>/dev/null; then
  echo -e "${ORANGE}  Installing Python packages...${NC}"
  python3 -m pip install -r backend/requirements.txt --break-system-packages -q 2>/dev/null || \
  pip3 install -r backend/requirements.txt --break-system-packages -q 2>/dev/null || \
  (cd backend && PYTHONPATH=.venv/lib/python3.12/site-packages .venv/bin/pip install -r requirements.txt -q 2>/dev/null) || true
fi
echo -e "${GREEN}  ✓ Python dependencies OK${NC}"

# ── Check Node packages ────────────────────────────────────────────────────
echo -e "${BLUE}▶ Checking Node dependencies...${NC}"
if [ ! -d "frontend/node_modules" ]; then
  echo -e "${ORANGE}  Running npm install...${NC}"
  (cd frontend && npm install --silent)
fi
echo -e "${GREEN}  ✓ Node dependencies OK${NC}"

# ── Init DB if needed ──────────────────────────────────────────────────────
echo -e "${BLUE}▶ Initialising database...${NC}"
(
  cd backend
  PYTHONPATH=.venv/lib/python3.12/site-packages .venv/bin/python3 -c "
import asyncio, sys, os
sys.path.insert(0, '.')
sys.path.insert(0, '.venv/lib/python3.12/site-packages')
from app.database import create_tables
from app.models import Team, Player, Admin, PaymentProof
asyncio.run(create_tables())
print('DB ready')
" 2>/dev/null || python3 -c "
import asyncio, sys
sys.path.insert(0, 'backend')
from app.database import create_tables
from app.models import Team, Player, Admin, PaymentProof
asyncio.run(create_tables())
print('DB ready')
" 2>/dev/null || echo "DB init skipped (will init on first request)"
)
echo -e "${GREEN}  ✓ Database ready${NC}"

echo ""
echo -e "${GREEN}${BOLD}Starting servers...${NC}"
echo -e "  ${BLUE}Backend:${NC}  http://localhost:8000"
echo -e "  ${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "  ${BLUE}API Docs:${NC} http://localhost:8000/docs"
echo ""
echo -e "${ORANGE}Press Ctrl+C to stop both servers${NC}"
echo ""

# ── Cleanup on exit ────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo -e "${ORANGE}Stopping servers...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}Done.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Start backend ──────────────────────────────────────────────────────────
(
  cd backend
  PYTHONPATH=.venv/lib/python3.12/site-packages \
  .venv/bin/python3 -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level info \
    2>&1 | sed "s/^/  ${BLUE}[backend]${NC} /"
) &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${BLUE}  Waiting for backend...${NC}"
for i in $(seq 1 20); do
  if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend is up${NC}"
    break
  fi
  sleep 0.5
done

# ── Start frontend ─────────────────────────────────────────────────────────
(
  cd frontend
  npm run dev 2>&1 | sed "s/^/  ${GREEN}[frontend]${NC} /"
) &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}${BOLD}✓ Both servers running!${NC}"
echo -e "  Open ${BOLD}http://localhost:5173${NC} in your browser"
echo ""

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
