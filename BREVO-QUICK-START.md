# Brevo SMTP - Quick Start

## ✅ Configuration Files Updated

I've updated both configuration files to use Brevo SMTP:
- `backend/.env` (development)
- `backend/.env.production` (production)

## 🚀 What You Need to Do

### 1. Get Brevo Credentials (5 minutes)

**Go to**: https://app.brevo.com/

#### A. Create SMTP Key
1. Click your name (top right) → **SMTP & API** → **SMTP** tab
2. Click **"Create a new SMTP key"**
3. Name: `Shining Star Tournament`
4. **Copy the key** (starts with `xsmtpsib-`)

#### B. Verify Sender Email
1. Go to **Senders & IP** → **Senders**
2. Click **"Add a sender"**
3. Enter your email (e.g., `sarlongkiteron484@gmail.com`)
4. Click verification link in your email

### 2. Give Me Your Credentials

Tell me:
1. **SMTP Key**: `xsmtpsib-...` (the long key you copied)
2. **Sender Email**: The email you verified

**I'll configure everything and test it for you!**

---

## Or Configure Manually

Edit `backend/.env`:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=your_brevo_login_email@example.com
SMTP_PASSWORD=xsmtpsib-your_actual_key_here
SMTP_FROM=your_verified_sender@example.com
```

Then:
```bash
./stop.sh
./dev.sh
python3 test-email.py
```

---

## Why Brevo?

| Feature | Gmail | Brevo |
|---------|-------|-------|
| Setup | Complex (2FA + App Password) | Simple (Just API key) |
| Free Tier | Limited | 300 emails/day |
| Deliverability | Can go to spam | Professional |
| Monitoring | None | Dashboard with stats |
| Best For | Personal | Business/Apps |

---

## Current Status

⏸️ **Email is configured but needs your credentials**

Configuration files are ready with Brevo settings. Just need:
- Your SMTP key
- Your verified sender email

**Give me these and I'll complete the setup!**

See **BREVO-SETUP-GUIDE.md** for detailed step-by-step instructions.
