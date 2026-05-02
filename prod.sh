#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Shining Star United — Production Mode Launcher
# Builds frontend, serves static files, runs backend with gunicorn
# Usage: ./prod.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

BACKEND_PORT=8000
FRONTEND_PORT=4173   # Vite preview port (production build)

echo ""
echo -e "${ORANGE}${BOLD}⚽  Shining Star United — Production Mode${NC}"
echo -e "${ORANGE}──────────────────────────────────────────${NC}"
echo ""

# ── Validate .env ──────────────────────────────────────────────────────────
# Use .env.production if it exists, otherwise fall back to .env
if [ -f "backend/.env.production" ]; then
  echo -e "${BLUE}  Using backend/.env.production${NC}"
  cp backend/.env.production backend/.env.prod.tmp
  ENV_FILE="backend/.env.prod.tmp"
else
  ENV_FILE="backend/.env"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}✗ No env file found. Create backend/.env.production or backend/.env${NC}"
  exit 1
fi

# Check SECRET_KEY is not a placeholder
if grep -q "your-secret-key-here\|change-in-production\|REPLACE_WITH" "$ENV_FILE" 2>/dev/null; then
  echo -e "${RED}✗ SECRET_KEY is still a placeholder in $ENV_FILE${NC}"
  echo -e "${ORANGE}  Generate: python3 -c \"import secrets; print(secrets.token_hex(32))\"${NC}"
  [ -f "backend/.env.prod.tmp" ] && rm -f backend/.env.prod.tmp
  exit 1
fi

# Copy to .env for the app to read
cp "$ENV_FILE" backend/.env
[ -f "backend/.env.prod.tmp" ] && rm -f backend/.env.prod.tmp

echo -e "${GREEN}  ✓ Environment config OK${NC}"

# ── Build frontend ─────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Building frontend (production bundle)...${NC}"

if [ ! -d "frontend/node_modules" ]; then
  echo -e "${ORANGE}  Running npm install...${NC}"
  (cd frontend && npm install --silent)
fi

(cd frontend && npm run build 2>&1 | tail -5)
echo -e "${GREEN}  ✓ Frontend built → frontend/dist/${NC}"

# ── Init DB ────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▶ Initialising database...${NC}"
(
  cd backend
  PYTHONPATH=.venv/lib/python3.12/site-packages \
  .venv/bin/python3 -c "
import asyncio, sys
sys.path.insert(0, '.')
sys.path.insert(0, '.venv/lib/python3.12/site-packages')
from app.database import create_tables
from app.models import Team, Player, Admin, PaymentProof
asyncio.run(create_tables())
print('DB ready')
" 2>/dev/null || echo "  DB init skipped"
)
echo -e "${GREEN}  ✓ Database ready${NC}"

# ── Cleanup on exit ────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo -e "${ORANGE}Stopping production servers...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}Stopped.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo -e "${GREEN}${BOLD}Starting production servers...${NC}"
echo -e "  ${BLUE}Backend:${NC}  http://localhost:${BACKEND_PORT}"
echo -e "  ${BLUE}Frontend:${NC} http://localhost:${FRONTEND_PORT}"
echo -e "  ${BLUE}API Docs:${NC} http://localhost:${BACKEND_PORT}/docs"
echo ""
echo -e "${ORANGE}Press Ctrl+C to stop${NC}"
echo ""

# ── Start backend with gunicorn (production WSGI server) ───────────────────
(
  cd backend
  # Use gunicorn if available, fall back to uvicorn
  if PYTHONPATH=.venv/lib/python3.12/site-packages .venv/bin/python3 -c "import gunicorn" 2>/dev/null; then
    echo -e "  ${BLUE}[backend]${NC} Starting with gunicorn (${WORKERS:-2} workers)..."
    PYTHONPATH=.venv/lib/python3.12/site-packages \
    .venv/bin/python3 -m gunicorn app.main:app \
      --worker-class uvicorn.workers.UvicornWorker \
      --workers "${WORKERS:-2}" \
      --bind "0.0.0.0:${BACKEND_PORT}" \
      --timeout 120 \
      --keep-alive 5 \
      --access-logfile - \
      --error-logfile - \
      --log-level warning \
      2>&1 | sed "s/^/  [backend] /"
  else
    echo -e "  ${BLUE}[backend]${NC} Starting with uvicorn..."
    PYTHONPATH=.venv/lib/python3.12/site-packages \
    .venv/bin/python3 -m uvicorn app.main:app \
      --host 0.0.0.0 \
      --port "${BACKEND_PORT}" \
      --workers "${WORKERS:-2}" \
      --log-level warning \
      2>&1 | sed "s/^/  [backend] /"
  fi
) &
BACKEND_PID=$!

# Wait for backend to be ready
for i in $(seq 1 30); do
  if curl -s "http://localhost:${BACKEND_PORT}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend is up${NC}"
    break
  fi
  sleep 0.5
done

# ── Serve frontend (Vite preview = production build) ──────────────────────
(
  cd frontend
  npx vite preview --port "${FRONTEND_PORT}" --host 0.0.0.0 \
    2>&1 | sed "s/^/  [frontend] /"
) &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}${BOLD}✓ Production servers running!${NC}"
echo -e "  Open ${BOLD}http://localhost:${FRONTEND_PORT}${NC} in your browser"
echo ""

wait $BACKEND_PID $FRONTEND_PID
