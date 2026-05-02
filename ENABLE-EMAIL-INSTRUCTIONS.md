# How to Enable Email - Quick Guide

## Current Status
✅ Email is **temporarily disabled** so you can test the application
✅ Application works normally, emails are just skipped
✅ You'll see in logs: "SMTP not configured — skipping email"

## When You're Ready to Enable Email

### You Need To:
1. Log in to Gmail account: **sarlongkiteron484@gmail.com**
2. Go to: https://myaccount.google.com/apppasswords
3. Generate a new app password (16 characters)
4. Update the password in configuration files
5. Restart the servers

### Detailed Steps:

#### Step 1: Enable 2-Factor Authentication (if not already on)
- Go to: https://myaccount.google.com/security
- Click "2-Step Verification"
- Follow prompts to enable it

#### Step 2: Generate App Password
- Go to: https://myaccount.google.com/apppasswords
- Select app: **Mail**
- Select device: **Other (Custom name)**
- Name: `Shining Star Tournament`
- Click **Generate**
- Copy the 16-character password (remove spaces)

#### Step 3: Update Configuration

Edit **backend/.env** (line 23):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PASSWORD=paste_your_new_password_here
```

Edit **backend/.env.production** (line 18):
```env
SMTP_PASSWORD=paste_your_new_password_here
```

#### Step 4: Restart Servers
```bash
./stop.sh
./dev.sh
```

#### Step 5: Test
```bash
python3 test-email.py
```

## What Happens Without Email?

The application works perfectly, but:
- ❌ Users won't receive registration confirmation emails
- ❌ Users won't receive approval/rejection notification emails
- ✅ All other features work normally
- ✅ Registrations are saved to database
- ✅ Admin can approve/reject registrations
- ✅ Payment proofs are uploaded and stored

## For Production

Before deploying to production, you **MUST** enable email so users receive:
1. Registration confirmation with their Registration ID
2. Approval/rejection notifications

## Alternative Email Services

If you don't want to use Gmail, you can use:
- **Outlook/Hotmail** (easier setup, no app password needed)
- **SendGrid** (recommended for production, free tier)
- **Mailgun** (good for production)

See **EMAIL-SETUP-GUIDE.md** for details on alternative services.

## Need Help?

If you need help generating the app password:
1. Make sure you can log in to sarlongkiteron484@gmail.com
2. Check if 2FA is enabled
3. Follow the steps above
4. If you get stuck, let me know which step is causing issues
