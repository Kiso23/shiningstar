# ✅ Render Deployment Checklist

Print this and check off each step as you complete it!

---

## 📋 Pre-Deployment

- [ ] GitHub account created
- [ ] Render account created (use GitHub to sign up)
- [ ] Code pushed to GitHub repository

---

## 🗄️ Database Setup

- [ ] Created PostgreSQL database on Render
  - Name: `ssu-database`
  - Region: Singapore
  - Plan: Free
- [ ] Copied **Internal Database URL**
- [ ] Saved URL somewhere safe

---

## 🔙 Backend Deployment

- [ ] Created Web Service on Render
  - Name: `ssu-backend`
  - Root Directory: `backend`
  - Environment: Docker
  - Region: Singapore
  - Plan: Free

- [ ] Added all environment variables:
  - [ ] `DATABASE_URL` (pasted from database)
  - [ ] `SECRET_KEY`
  - [ ] `ALGORITHM`
  - [ ] `ACCESS_TOKEN_EXPIRE_MINUTES`
  - [ ] `UPLOAD_DIR`
  - [ ] `CORS_ORIGINS`
  - [ ] `SMTP_HOST`
  - [ ] `SMTP_PORT`
  - [ ] `SMTP_TLS`
  - [ ] `SMTP_USER`
  - [ ] `SMTP_PASSWORD`
  - [ ] `SMTP_FROM`

- [ ] Backend deployed successfully (green checkmark)
- [ ] Copied backend URL
- [ ] Tested backend: visited `/api/v1/docs`

---

## 🎨 Frontend Deployment

- [ ] Created Static Site on Render
  - Name: `ssu-frontend`
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

- [ ] Added environment variable:
  - [ ] `VITE_API_BASE_URL` (backend URL + `/api/v1`)

- [ ] Frontend deployed successfully (green checkmark)
- [ ] Copied frontend URL
- [ ] Tested frontend: opened in browser

---

## 👤 Admin Account

- [ ] Opened backend Shell on Render
- [ ] Ran create admin command
- [ ] Saw "Admin account created" message
- [ ] Tested login at frontend `/admin/login`

---

## 🔄 CORS Update

- [ ] Updated backend `CORS_ORIGINS` with frontend URL
- [ ] Saved changes
- [ ] Waited for backend to redeploy
- [ ] Tested registration flow works

---

## ✅ Final Testing

- [ ] Visited frontend URL - loads correctly
- [ ] Homepage displays properly
- [ ] "Register Your Team" button works
- [ ] Can fill registration form
- [ ] Can add players
- [ ] Can upload payment proof
- [ ] Registration submits successfully
- [ ] Admin login works
- [ ] Can see registrations in admin dashboard
- [ ] Can approve/reject registrations
- [ ] Email notifications working

---

## 📱 Go Live!

- [ ] Shared frontend URL with team
- [ ] Tested on mobile device
- [ ] Tested on different browser
- [ ] Bookmarked admin dashboard
- [ ] Saved admin credentials securely

---

## 🎉 Deployment Complete!

**Frontend URL**: ________________________________

**Backend URL**: ________________________________

**Admin Email**: admin@shiningstarunited.com

**Admin Password**: Shiningstar@1234

---

## 📝 Notes

Write any issues or observations here:

_____________________________________________

_____________________________________________

_____________________________________________

_____________________________________________
