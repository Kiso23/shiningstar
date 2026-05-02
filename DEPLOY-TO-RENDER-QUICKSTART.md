# 🚀 Quick Start: Deploy to Render.com

## ⚡ 5-Minute Deployment Guide

Follow these steps to make your website live on the internet for FREE!

---

## 📝 Before You Start

You need:
1. ✅ GitHub account (create at https://github.com)
2. ✅ Render account (create at https://render.com - sign up with GitHub)
3. ✅ Your code pushed to GitHub

---

## 🔥 STEP-BY-STEP DEPLOYMENT

### 1️⃣ Push to GitHub (If not done yet)

```bash
# In your project folder
git init
git add .
git commit -m "Deploy Shining Star United"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### 2️⃣ Create Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - Name: `ssu-database`
   - Database: `ssu_tournament`  
   - User: `ssu`
   - Region: **Singapore**
   - Plan: **Free**
4. Click **"Create Database"**
5. ⚠️ **COPY THE "Internal Database URL"** - you'll need it next!

---

### 3️⃣ Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. **Connect your GitHub repo**
3. Fill in:
   - Name: `ssu-backend`
   - Region: **Singapore**
   - Root Directory: `backend`
   - Environment: **Docker**
   - Plan: **Free**

4. **Add Environment Variables** (click "Add Environment Variable"):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *Paste the Internal Database URL from step 2* |
| `SECRET_KEY` | `a1efb23b956ed760244fbd9be48a0bcca8970f3bd124241fb9fd99ce467d3722` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `UPLOAD_DIR` | `/app/uploads` |
| `CORS_ORIGINS` | `["*"]` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_TLS` | `true` |
| `SMTP_USER` | `sarlongki360@gmail.com` |
| `SMTP_PASSWORD` | `lckmvihohphjilqa` |
| `SMTP_FROM` | `sarlongki360@gmail.com` |

5. Click **"Create Web Service"**
6. ⏳ Wait 5-10 minutes for deployment
7. ⚠️ **COPY YOUR BACKEND URL** (e.g., `https://ssu-backend.onrender.com`)

---

### 4️⃣ Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. **Connect your GitHub repo**
3. Fill in:
   - Name: `ssu-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://ssu-backend.onrender.com/api/v1` |

   ⚠️ Replace with YOUR actual backend URL from step 3!

5. Click **"Create Static Site"**
6. ⏳ Wait 3-5 minutes for deployment

---

### 5️⃣ Create Admin Account

1. Go to your **backend service** on Render
2. Click the **"Shell"** tab (top right)
3. Run this command:
   ```bash
   python -m scripts.create_admin --email admin@shiningstarunited.com --password Shiningstar@1234
   ```
4. You should see: "Admin account created"

---

### 6️⃣ Update CORS (Important!)

1. Go to your **backend service** → **Environment**
2. Find `CORS_ORIGINS` variable
3. Update it with your frontend URL:
   ```
   ["https://ssu-frontend.onrender.com"]
   ```
   ⚠️ Use YOUR actual frontend URL!
4. Click **"Save Changes"**
5. Backend will automatically redeploy (2-3 minutes)

---

## 🎉 YOU'RE LIVE!

Your website is now accessible worldwide!

### 🌐 Your URLs:
- **Website**: `https://ssu-frontend.onrender.com`
- **Admin**: `https://ssu-frontend.onrender.com/admin/login`
- **API Docs**: `https://ssu-backend.onrender.com/api/v1/docs`

### 🔑 Admin Login:
- **Email**: `admin@shiningstarunited.com`
- **Password**: `Shiningstar@1234`

---

## ⚠️ IMPORTANT: Free Tier Notes

### Services Sleep After 15 Minutes
- Free services "spin down" when inactive
- First request after sleep takes 30-60 seconds
- This is normal - just wait!

### Wake Up Your Services
Before sharing with users, visit both URLs to wake them up:
1. Visit your frontend URL
2. Visit your backend URL + `/api/v1/docs`

### Keep Services Awake (Optional)
Use a free service like **UptimeRobot** (https://uptimerobot.com):
- Pings your URLs every 5 minutes
- Keeps services awake during business hours

---

## 🔧 Common Issues

### "Cannot connect to backend"
- Check VITE_API_BASE_URL is correct in frontend
- Check CORS_ORIGINS includes your frontend URL in backend
- Wait 30 seconds for backend to wake up

### "Database connection error"
- Verify DATABASE_URL is correct
- Check database is running in Render dashboard

### "Admin login not working"
- Make sure you created admin account (Step 5)
- Check backend logs for errors

---

## 📱 Share Your Website!

Your tournament registration is now live! Share this URL with teams:

**`https://ssu-frontend.onrender.com`**

---

## 🔄 Making Updates

When you push changes to GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

Render automatically:
1. Detects the change
2. Rebuilds your services
3. Deploys updates (3-10 minutes)

---

## 💡 Pro Tips

### Custom Domain
Want `shiningstarunited.com` instead of `.onrender.com`?
1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Render: Service → Settings → Custom Domain
3. Follow DNS instructions

### Upgrade for Production
Free tier is great for testing, but for real users:
- **Starter Plan**: $7/month (no sleep, faster)
- **Database Plan**: $7/month (no expiration, backups)

### Monitor Your Site
- Check Render dashboard for service status
- View logs for debugging
- Set up email alerts in Render settings

---

## 🆘 Need Help?

1. Check Render logs (Dashboard → Service → Logs)
2. Visit Render docs: https://render.com/docs
3. Check your environment variables are correct

---

**Congratulations! Your tournament registration system is LIVE! 🎉⚽**
