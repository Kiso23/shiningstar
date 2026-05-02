#!/bin/bash
# Stop all dev/production servers
echo "Stopping servers..."
pkill -f "uvicorn app.main:app" 2>/dev/null && echo "  ✓ Backend (uvicorn) stopped" || true
pkill -f "gunicorn app.main:app" 2>/dev/null && echo "  ✓ Backend (gunicorn) stopped" || true
pkill -f "vite" 2>/dev/null && echo "  ✓ Frontend stopped" || true
echo "Done."
