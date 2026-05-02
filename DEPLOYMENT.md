# 🚀 Deployment Checklist — Shining Star United

This guide walks you through deploying the tournament registration system to production.

---

## ⚠️ Pre-Deployment Security Checklist

### 1. **Environment Variables**

- [ ] **Generate a new SECRET_KEY** (never reuse the dev key)
  ```bash
  python3 -c "import secrets; print(secrets.token_hex(32))"
  ```
  Update `backend/.env.production` with the generated key

- [ ] **Set PostgreSQL credentials**
  - Update `DATABASE_URL` in `backend/.env.production`
  - Replace `CHANGE_PASSWORD` with a strong password
  - Example: `postgresql+asyncpg://ssu:YOUR_STRONG_PASSWORD@localhost:5432/ssu_tournament`

- [ ] **Update CORS_ORIGINS**
  - Replace `https://yourdomain.com` with your actual domain
  - Keep `http://localhost:4173` only if you need local testing

- [ ] **Rotate SMTP credentials** (CRITICAL — currently exposed)
  - The current Gmail app password in the file is exposed
  - Generate a new Gmail App Password:
    1. Go to Google Account → Security → 2-Step Verification → App passwords
    2. Generate a new password for "Mail"
    3. Update `SMTP_PASSWORD` in `backend/.env.production`
  - Or use a different email service (SendGrid, AWS SES, etc.)

### 2. **File Permissions**

```bash
# Restrict access to environment files
chmod 600 backend/.env.production
chmod 600 backend/.env

# Ensure uploads directory exists with correct permissions
mkdir -p backend/uploads/logos backend/uploads/payment_proofs
chmod 755 backend/uploads
```

### 3. **Version Control**

- [ ] **Verify .gitignore is working**
  ```bash
  git status
  # Should NOT show .env files or uploads/
  ```

- [ ] **Check git history for leaked secrets**
  ```bash
  git log --all --full-history -- "*.env*"
  # If any .env files were committed, they need to be removed from history
  ```

- [ ] **If secrets were committed, clean git history**
  ```bash
  # WARNING: This rewrites history. Coordinate with your team first.
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch backend/.env backend/.env.production" \
    --prune-empty --tag-name-filter cat -- --all
  
  # Force push (only if you're sure)
  git push origin --force --all
  ```

### 4. **Database Setup**

- [ ] **Install PostgreSQL** (if not already installed)
  ```bash
  # Ubuntu/Debian
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  
  # macOS
  brew install postgresql
  ```

- [ ] **Create database and user**
  ```bash
  sudo -u postgres psql
  ```
  ```sql
  CREATE DATABASE ssu_tournament;
  CREATE USER ssu WITH PASSWORD 'YOUR_STRONG_PASSWORD';
  GRANT ALL PRIVILEGES ON DATABASE ssu_tournament TO ssu;
  \q
  ```

- [ ] **Initialize database tables**
  ```bash
  cd backend
  source .venv/bin/activate
  python -m scripts.init_db
  ```

- [ ] **Create admin account**
  ```bash
  python -m scripts.create_admin \
    --email admin@yourdomain.com \
    --password YOUR_ADMIN_PASSWORD
  ```

---

## 🏗️ Deployment Options

### Option 1: Local/VPS Deployment (Recommended for Quick Start)

#### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+

#### Steps

1. **Clone and setup**
   ```bash
   git clone <your-repo-url>
   cd shining-star-united
   ```

2. **Backend setup**
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   
   # Copy and configure production env
   cp .env.production .env
   # Edit .env with your actual values
   
   # Initialize database
   python -m scripts.init_db
   python -m scripts.create_admin --email admin@yourdomain.com --password <password>
   ```

3. **Frontend setup**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

4. **Start production servers**
   ```bash
   cd ..
   ./prod.sh
   ```

5. **Access the application**
   - Frontend: http://localhost:4173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

#### Using a Process Manager (Recommended)

For production, use a process manager like `systemd` or `pm2`:

**systemd service example:**

```bash
# Create /etc/systemd/system/ssu-backend.service
[Unit]
Description=Shining Star United Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/shining-star-united/backend
Environment="PATH=/path/to/shining-star-united/backend/.venv/bin"
ExecStart=/path/to/shining-star-united/backend/.venv/bin/gunicorn app.main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 120
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ssu-backend
sudo systemctl start ssu-backend
```

### Option 2: Docker Deployment

#### Prerequisites
- Docker 20+
- Docker Compose 2+

#### Steps

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build and start**
   ```bash
   docker-compose up --build -d
   ```

3. **Create admin account**
   ```bash
   docker-compose exec backend python -m scripts.create_admin \
     --email admin@yourdomain.com \
     --password <password>
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

---

## 🔒 Post-Deployment Security

### 1. **Setup HTTPS (Required for Production)**

Use a reverse proxy like Nginx with Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

**Nginx configuration example:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (static files)
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. **Firewall Configuration**

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 3. **Database Backups**

```bash
# Create backup script
cat > /usr/local/bin/backup-ssu-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/ssu"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U ssu ssu_tournament | gzip > $BACKUP_DIR/ssu_tournament_$DATE.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-ssu-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-ssu-db.sh" | sudo crontab -
```

### 4. **Monitoring**

- [ ] Setup application monitoring (e.g., Sentry for error tracking)
- [ ] Setup uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Configure log rotation
  ```bash
  # /etc/logrotate.d/ssu
  /var/log/ssu/*.log {
      daily
      rotate 14
      compress
      delaycompress
      notifempty
      create 0640 www-data www-data
      sharedscripts
  }
  ```

---

## 🧪 Testing Production Setup

### 1. **Health Check**
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### 2. **API Documentation**
Visit: http://localhost:8000/docs

### 3. **Test Registration Flow**
1. Open frontend in browser
2. Complete a test registration
3. Login to admin dashboard
4. Verify registration appears
5. Test approve/reject actions
6. Test export functionality

### 4. **Run Integration Tests**
```bash
cd backend
pytest tests/test_integration.py -v
```

---

## 📊 Performance Tuning

### Gunicorn Workers

```bash
# Rule of thumb: (2 × CPU cores) + 1
WORKERS=5 ./prod.sh
```

### Database Connection Pool

Edit `backend/app/database.py`:
```python
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,        # Increase for high traffic
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
)
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
journalctl -u ssu-backend -f

# Common issues:
# 1. Database connection failed → verify DATABASE_URL
# 2. Port already in use → check with: lsof -i :8000
# 3. Missing dependencies → pip install -r requirements.txt
```

### Frontend shows API errors
```bash
# Check CORS settings in backend/.env
# Ensure CORS_ORIGINS includes your frontend domain
```

### File uploads fail
```bash
# Check upload directory permissions
ls -la backend/uploads/
chmod 755 backend/uploads
```

### Email notifications not working
```bash
# Test SMTP connection
python3 << EOF
import smtplib
from email.mime.text import MIMEText

msg = MIMEText("Test")
msg['Subject'] = 'Test'
msg['From'] = 'your@gmail.com'
msg['To'] = 'test@example.com'

with smtplib.SMTP('smtp.gmail.com', 587) as server:
    server.starttls()
    server.login('your@gmail.com', 'your-app-password')
    server.send_message(msg)
    print("Email sent successfully!")
EOF
```

---

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
source .venv/bin/activate
pip install -r requirements.txt

# Run database migrations (if any)
# python -m alembic upgrade head

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl restart ssu-backend
# or
./stop.sh && ./prod.sh
```

---

## 📞 Support

For issues or questions:
- Check the main [README.md](README.md)
- Review [API documentation](http://localhost:8000/docs)
- Check application logs

---

**Last Updated:** May 2, 2026
