# 🚀 Docker Deployment Instructions

## Quick Start

You have two options to deploy:

### Option 1: Add your user to docker group (Recommended - No sudo needed)

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and log back in (or run this to apply immediately)
newgrp docker

# Verify docker works without sudo
docker ps

# Now run deployment
./deploy.sh
```

### Option 2: Run with sudo

```bash
# Run deployment with sudo
sudo ./deploy.sh
```

---

## Manual Deployment Steps

If the script doesn't work, you can deploy manually:

### 1. Stop existing containers
```bash
sudo docker-compose down
```

### 2. Build images
```bash
sudo docker-compose build --no-cache
```

### 3. Start services
```bash
sudo docker-compose up -d
```

### 4. Wait for database (30 seconds)
```bash
sleep 30
```

### 5. Initialize database
```bash
sudo docker-compose exec -T backend python -m scripts.init_db
```

### 6. Create admin account
```bash
sudo docker-compose exec -T backend python -m scripts.create_admin \
    --email admin@shiningstarunited.com \
    --password Shiningstar@1234
```

### 7. Check status
```bash
sudo docker-compose ps
```

---

## Access the Application

Once deployed:

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/v1
- **API Docs**: http://localhost/api/v1/docs

**Admin Credentials:**
- Email: `admin@shiningstarunited.com`
- Password: `Shiningstar@1234`

---

## Useful Commands

```bash
# View logs
sudo docker-compose logs -f

# View specific service logs
sudo docker-compose logs -f backend
sudo docker-compose logs -f frontend
sudo docker-compose logs -f db

# Stop services
sudo docker-compose down

# Restart services
sudo docker-compose restart

# View running containers
sudo docker-compose ps

# Access backend shell
sudo docker-compose exec backend bash

# Access database
sudo docker-compose exec db psql -U ssu -d ssu_tournament
```

---

## Troubleshooting

### Port 80 already in use
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop the service or change PORT in .env
PORT=8080 sudo docker-compose up -d
```

### Database connection issues
```bash
# Check database logs
sudo docker-compose logs db

# Restart database
sudo docker-compose restart db
```

### Backend not starting
```bash
# Check backend logs
sudo docker-compose logs backend

# Rebuild backend
sudo docker-compose build --no-cache backend
sudo docker-compose up -d backend
```

### Frontend not loading
```bash
# Check frontend logs
sudo docker-compose logs frontend

# Rebuild frontend
sudo docker-compose build --no-cache frontend
sudo docker-compose up -d frontend
```

---

## Production Deployment

For production deployment on a server:

1. **Update .env file** with production values:
   - Change `CORS_ORIGINS` to your domain
   - Use strong passwords
   - Update `PORT` if needed

2. **Setup HTTPS** with Nginx reverse proxy:
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Configure firewall**:
   ```bash
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```

4. **Setup automatic backups** (see DEPLOYMENT.md for details)

---

## Next Steps

1. Test the registration flow
2. Test admin dashboard
3. Test email notifications
4. Setup monitoring
5. Configure backups

For more details, see [DEPLOYMENT.md](DEPLOYMENT.md)
