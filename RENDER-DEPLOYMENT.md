# 🚀 Deploy to Render.com

This guide will help you deploy the Shining Star United application to Render.com for free public access.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Render Account** - Sign up at https://render.com (free)
3. **Gmail App Password** - For email notifications (you already have this)

---

## 🔧 Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Shining Star United Tournament System"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `ssu-database`
   - **Database**: `ssu_tournament`
   - **User**: `ssu`
   - **Region**: Singapore (or closest to you)
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **IMPORTANT**: Copy the **Internal Database URL** (starts with `postgresql://`)
   - You'll need this for the backend

---

## 🔙 Step 3: Deploy Backend API

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ssu-backend`
   - **Region**: Singapore (same as database)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: **Free**

4. **Environment Variables** - Add these:

   ```
   DATABASE_URL = <paste Internal Database URL from Step 2>
   SECRET_KEY = a1efb23b956ed760244fbd9be48a0bcca8970f3bd124241fb9fd99ce467d3722
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 1440
   UPLOAD_DIR = /app/uploads
   CORS_ORIGINS = ["https://ssu-frontend.onrender.com"]
   SMTP_HOST = smtp.gmail.com
   SMTP_PORT = 587
   SMTP_TLS = true
   SMTP_USER = sarlongki360@gmail.com
   SMTP_PASSWORD = lckmvihohphjilqa
   SMTP_FROM = sarlongki360@gmail.com
   ```

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Copy the backend URL** (e.g., `https://ssu-backend.onrender.com`)

---

## 🎨 Step 4: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ssu-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables** - Add this:
   ```
   VITE_API_BASE_URL = <paste your backend URL from Step 3>/api/v1
   ```
   Example: `https://ssu-backend.onrender.com/api/v1`

5. Click **"Create Static Site"**
6. Wait for deployment (3-5 minutes)

---

## 🔄 Step 5: Update Backend CORS

After frontend is deployed:

1. Go to your backend service on Render
2. Update the `CORS_ORIGINS` environment variable with your actual frontend URL:
   ```
   CORS_ORIGINS = ["https://ssu-frontend.onrender.com"]
   ```
   (Replace with your actual frontend URL)
3. Save and wait for backend to redeploy

---

## 👤 Step 6: Create Admin Account

After backend is deployed:

1. Go to your backend service on Render
2. Click **"Shell"** tab
3. Run this command:
   ```bash
   python -m scripts.create_admin --email admin@shiningstarunited.com --password Shiningstar@1234
   ```

---

## ✅ Step 7: Test Your Live Application

Your application is now live!

- **Frontend**: `https://ssu-frontend.onrender.com`
- **Backend API**: `https://ssu-backend.onrender.com/api/v1`
- **API Docs**: `https://ssu-backend.onrender.com/api/v1/docs`

**Admin Login:**
- Email: `admin@shiningstarunited.com`
- Password: `Shiningstar@1234`

---

## ⚠️ Important Notes

### Free Tier Limitations

1. **Services spin down after 15 minutes of inactivity**
   - First request after inactivity takes 30-60 seconds to wake up
   - This is normal for free tier

2. **Database**
   - Free PostgreSQL expires after 90 days
   - Backup your data regularly

3. **Storage**
   - Uploaded files (logos, payment proofs) are stored in ephemeral storage
   - Files may be lost on redeploy
   - For production, use cloud storage (AWS S3, Cloudinary, etc.)

### Custom Domain (Optional)

To use your own domain:
1. Go to your frontend service → **Settings** → **Custom Domain**
2. Add your domain and follow DNS instructions

---

## 🔧 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Check VITE_API_BASE_URL is correct
- Verify CORS_ORIGINS includes your frontend URL
- Check backend is running (visit /api/v1/docs)

### Database connection errors
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Check database is running in Render dashboard

### Email not working
- Verify SMTP credentials are correct
- Check Gmail app password hasn't expired
- Test with a simple registration

---

## 📊 Monitoring

### View Logs
- Go to service → **Logs** tab
- Real-time logs for debugging

### Check Service Status
- Dashboard shows if services are running
- Green = healthy, Red = error

---

## 💰 Upgrade to Paid Plan (Optional)

For production use, consider upgrading:

**Starter Plan ($7/month per service):**
- No spin down
- Faster performance
- More resources
- Better for real users

**Database Plan ($7/month):**
- No 90-day expiration
- Automatic backups
- Better performance

---

## 🔄 Updating Your Application

When you push changes to GitHub:
1. Render automatically detects changes
2. Rebuilds and redeploys
3. Takes 3-10 minutes

To disable auto-deploy:
- Go to service → **Settings** → **Build & Deploy**
- Turn off "Auto-Deploy"

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Your Logs**: Check Render dashboard for errors

---

## 🎉 You're Done!

Your tournament registration system is now live and accessible worldwide!

Share your frontend URL with teams to start accepting registrations! 🚀⚽
