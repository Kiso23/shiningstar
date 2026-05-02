# 🚀 Render Deployment - Step by Step

Follow these exact steps to deploy your website!

---

## 📋 STEP 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started"** or **"Sign Up"**
3. **Sign up with GitHub** (easiest option)
4. Authorize Render to access your GitHub account
5. You'll be redirected to Render Dashboard

✅ **Done? Proceed to Step 2**

---

## 🗄️ STEP 2: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** (top right)
2. Select **"PostgreSQL"**
3. Fill in the form:

   ```
   Name: ssu-database
   Database: ssu_tournament
   User: ssu
   Region: Singapore (or closest to you)
   PostgreSQL Version: 16 (default)
   Datadog API Key: (leave empty)
   Plan: Free
   ```

4. Click **"Create Database"**
5. Wait 1-2 minutes for database to be created
6. ⚠️ **IMPORTANT**: Once created, find and **COPY** the **"Internal Database URL"**
   - It looks like: `postgresql://ssu:xxxxx@dpg-xxxxx/ssu_tournament`
   - You'll need this in Step 3!

✅ **Copied the Internal Database URL? Proceed to Step 3**

---

## 🔙 STEP 3: Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"** → Select **"GitHub"**
3. Find and select: **Kiso23/shiningstar**
4. Click **"Connect"**
5. Fill in the form:

   ```
   Name: ssu-backend
   Region: Singapore (same as database!)
   Branch: main
   Root Directory: backend
   Runtime: Docker
   Instance Type: Free
   ```

6. Scroll down to **"Environment Variables"**
7. Click **"Add Environment Variable"** and add these **ONE BY ONE**:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | **PASTE YOUR INTERNAL DATABASE URL HERE** |
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

8. Click **"Create Web Service"**
9. ⏳ Wait 5-10 minutes for deployment (watch the logs!)
10. ⚠️ **IMPORTANT**: Once deployed, **COPY YOUR BACKEND URL**
    - It looks like: `https://ssu-backend.onrender.com`
    - You'll need this in Step 4!

✅ **Backend deployed and URL copied? Proceed to Step 4**

---

## 🎨 STEP 4: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Select your repository: **Kiso23/shiningstar**
3. Click **"Connect"**
4. Fill in the form:

   ```
   Name: ssu-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

5. Scroll down to **"Environment Variables"**
6. Click **"Add Environment Variable"**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://YOUR-BACKEND-URL.onrender.com/api/v1` |

   ⚠️ **Replace with YOUR actual backend URL from Step 3!**
   
   Example: `https://ssu-backend.onrender.com/api/v1`

7. Click **"Create Static Site"**
8. ⏳ Wait 3-5 minutes for deployment
9. ⚠️ **IMPORTANT**: Once deployed, **COPY YOUR FRONTEND URL**
    - It looks like: `https://ssu-frontend.onrender.com`

✅ **Frontend deployed? Proceed to Step 5**

---

## 🔄 STEP 5: Update Backend CORS

Now that frontend is deployed, update backend to allow requests from it:

1. Go to your **backend service** (ssu-backend)
2. Click **"Environment"** tab (left sidebar)
3. Find the `CORS_ORIGINS` variable
4. Click **"Edit"** (pencil icon)
5. Change value from `["*"]` to:
   ```
   ["https://YOUR-FRONTEND-URL.onrender.com"]
   ```
   Example: `["https://ssu-frontend.onrender.com"]`
6. Click **"Save Changes"**
7. Backend will automatically redeploy (2-3 minutes)

✅ **CORS updated? Proceed to Step 6**

---

## 👤 STEP 6: Create Admin Account

1. Go to your **backend service** (ssu-backend)
2. Click **"Shell"** tab (top right, next to "Logs")
3. Wait for shell to connect (may take 30 seconds)
4. Copy and paste this command:
   ```bash
   python -m scripts.create_admin --email admin@shiningstarunited.com --password Shiningstar@1234
   ```
5. Press **Enter**
6. You should see: `Admin account created for admin@shiningstarunited.com`

✅ **Admin created? Proceed to Step 7**

---

## 🎉 STEP 7: TEST YOUR LIVE WEBSITE!

### Test Frontend
1. Open your frontend URL in a browser
2. You should see the homepage with "KARDOM LAPEN KURVANGTHU ANGTON APHAN TA"
3. Click "Register Your Team"
4. Try filling the form

### Test Admin Login
1. Go to: `https://YOUR-FRONTEND-URL.onrender.com/admin/login`
2. Login with:
   - Email: `admin@shiningstarunited.com`
   - Password: `Shiningstar@1234`
3. You should see the admin dashboard

### Test Registration Flow
1. Go back to homepage
2. Complete a test registration:
   - Fill team details
   - Add players
   - Upload a test image as payment proof
   - Submit
3. Check admin dashboard to see the registration

---

## ✅ SUCCESS CHECKLIST

- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] CORS updated with frontend URL
- [ ] Admin account created
- [ ] Homepage loads correctly
- [ ] Admin login works
- [ ] Test registration submitted
- [ ] Registration appears in admin dashboard

---

## 🌐 YOUR LIVE URLS

Write them down here:

**Frontend (Public Website)**: _________________________________

**Backend API**: _________________________________

**Admin Dashboard**: _________________________________/admin/login

**Admin Credentials**:
- Email: `admin@shiningstarunited.com`
- Password: `Shiningstar@1234`

---

## ⚠️ IMPORTANT NOTES

### Free Tier Behavior
- Services "spin down" after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- This is NORMAL for free tier
- Just wait and refresh!

### Keep Services Awake
Use **UptimeRobot** (free) to ping your URLs every 5 minutes:
1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add monitors for your frontend and backend URLs
4. Set interval to 5 minutes

---

## 🆘 TROUBLESHOOTING

### Backend won't deploy
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Make sure DATABASE_URL is the Internal URL (not External)

### Frontend can't connect to backend
- Check VITE_API_BASE_URL is correct
- Verify CORS_ORIGINS includes your frontend URL
- Wait 30 seconds for backend to wake up

### Admin login doesn't work
- Make sure you created admin account (Step 6)
- Check backend logs for errors
- Try creating admin again

### Registration fails
- Check backend logs
- Verify email settings are correct
- Make sure database is running

---

## 🎊 CONGRATULATIONS!

Your tournament registration system is now LIVE on the internet!

**Share your frontend URL with teams to start accepting registrations!** 🚀⚽

---

## 📱 Next Steps

1. Share your website URL
2. Test with real registrations
3. Monitor via Render dashboard
4. Check email notifications work
5. Consider upgrading to paid plan for production use

---

**Need help?** Check the logs in Render dashboard or refer to `RENDER-DEPLOYMENT.md` for detailed troubleshooting.
