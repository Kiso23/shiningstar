# ⚡ Quick Reference — Shining Star United

Essential commands and information for daily operations.

---

## 🚀 Starting the Application

### Development Mode
```bash
./dev.sh                    # Start both backend + frontend with hot reload
./stop.sh                   # Stop all servers
```

### Production Mode
```bash
./prod.sh                   # Build frontend + start with gunicorn
WORKERS=4 ./prod.sh         # Start with 4 worker processes
./stop.sh                   # Stop all servers
```

---

## 🔐 Security

### Run Security Audit
```bash
./security-audit.sh         # Check for security issues
```

### Generate Secure Keys
```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate strong password
python3 -c "import secrets; print(secrets.token_urlsafe(24))"
```

### Fix File Permissions
```bash
chmod 600 backend/.env backend/.env.production
chmod 755 backend/uploads
```

---

## 🗄️ Database

### Initialize Database
```bash
cd backend
source .venv/bin/activate
python -m scripts.init_db
```

### Create Admin Account
```bash
cd backend
source .venv/bin/activate
python -m scripts.create_admin \
  --email admin@example.com \
  --password yourpassword
```

### PostgreSQL Commands
```bash
# Connect to database
sudo -u postgres psql

# Create database
CREATE DATABASE ssu_tournament;
CREATE USER ssu WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE ssu_tournament TO ssu;

# Backup database
pg_dump -U ssu ssu_tournament | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore database
gunzip -c backup_20260502.sql.gz | psql -U ssu ssu_tournament
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
source .venv/bin/activate
pytest tests/ -v                    # Run all tests
pytest tests/test_integration.py    # Run integration tests only
pytest tests/ -v --tb=short         # Short traceback
```

### Frontend Tests
```bash
cd frontend
npm run test                        # Run tests
npm run test:ui                     # Run with UI
```

---

## 📦 Dependencies

### Backend
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt     # Install dependencies
pip list                            # List installed packages
pip freeze > requirements.txt       # Update requirements
```

### Frontend
```bash
cd frontend
npm install                         # Install dependencies
npm update                          # Update packages
npm outdated                        # Check for updates
```

---

## 🔍 Debugging

### Check Application Health
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### View Logs
```bash
# Development mode (console output)
./dev.sh

# Production mode with systemd
sudo journalctl -u ssu-backend -f

# Docker
docker-compose logs -f
```

### Check Running Processes
```bash
# Find backend process
ps aux | grep uvicorn
ps aux | grep gunicorn

# Find frontend process
ps aux | grep vite

# Check ports
lsof -i :8000    # Backend
lsof -i :5173    # Frontend dev
lsof -i :4173    # Frontend production
```

---

## 🌐 URLs

### Development
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **API Redoc:** http://localhost:8000/redoc

### Production (Local)
- **Frontend:** http://localhost:4173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 📁 Important Files

### Configuration
```
backend/.env                    # Backend dev config
backend/.env.production         # Backend prod config
frontend/.env                   # Frontend config
docker-compose.yml              # Docker setup
```

### Scripts
```
dev.sh                          # Development launcher
prod.sh                         # Production launcher
stop.sh                         # Stop all servers
security-audit.sh               # Security checker
```

### Documentation
```
README.md                       # Main documentation
DEPLOYMENT.md                   # Deployment guide
SECURITY-SUMMARY.md             # Security status
QUICK-REFERENCE.md              # This file
```

---

## 🔧 Common Tasks

### Update Production Environment
```bash
# 1. Edit production config
nano backend/.env.production

# 2. Secure the file
chmod 600 backend/.env.production

# 3. Restart application
./stop.sh && ./prod.sh
```

### Add New Admin
```bash
cd backend
source .venv/bin/activate
python -m scripts.create_admin \
  --email newadmin@example.com \
  --password securepassword
```

### Clear Database (Development)
```bash
rm backend/dev.db
cd backend
source .venv/bin/activate
python -m scripts.init_db
```

### Rebuild Frontend
```bash
cd frontend
npm run build
```

### Export Registrations
```bash
# Via API (requires admin token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/admin/export?format=csv" \
  -o registrations.csv

# Or use the admin dashboard export button
```

---

## 🚨 Emergency Procedures

### Application Won't Start
```bash
# 1. Check if ports are in use
lsof -i :8000
lsof -i :5173

# 2. Kill processes if needed
./stop.sh
pkill -f uvicorn
pkill -f vite

# 3. Check environment files exist
ls -la backend/.env
ls -la frontend/.env

# 4. Verify dependencies
cd backend && source .venv/bin/activate && pip list
cd frontend && npm list
```

### Database Connection Failed
```bash
# 1. Check PostgreSQL is running
sudo systemctl status postgresql

# 2. Test connection
psql -U ssu -d ssu_tournament -h localhost

# 3. Check DATABASE_URL in .env
cat backend/.env | grep DATABASE_URL
```

### File Upload Errors
```bash
# 1. Check uploads directory exists
ls -la backend/uploads/

# 2. Create if missing
mkdir -p backend/uploads/logos backend/uploads/payment_proofs

# 3. Fix permissions
chmod 755 backend/uploads
chmod 755 backend/uploads/logos
chmod 755 backend/uploads/payment_proofs
```

---

## 📞 Getting Help

1. **Check logs** for error messages
2. **Run security audit** to identify configuration issues
3. **Review documentation:**
   - [README.md](README.md) — Overview and setup
   - [DEPLOYMENT.md](DEPLOYMENT.md) — Deployment guide
   - [SECURITY-SUMMARY.md](SECURITY-SUMMARY.md) — Security status
4. **Check API docs** at http://localhost:8000/docs

---

## 💡 Tips

- Always run `./security-audit.sh` before deploying
- Keep `.env` files secure (never commit to git)
- Use strong passwords (16+ characters)
- Enable HTTPS in production
- Backup database regularly
- Monitor application logs
- Update dependencies periodically

---

**Last Updated:** May 2, 2026
