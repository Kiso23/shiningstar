# Email Setup Guide - Gmail App Password

## Current Status

❌ **Email authentication is failing**

The Gmail app password `dyewdyewmfektcflxore` is being rejected by Gmail's SMTP server.

**Error**: `Username and Password not accepted`

## Why This Happens

Gmail app passwords can fail for several reasons:
1. **Password is incorrect** - Typo when copying the password
2. **Password expired** - Gmail app passwords can be revoked
3. **2FA not enabled** - App passwords require 2-factor authentication
4. **Account security** - Gmail blocked the password for security reasons

## How to Fix - Generate New Gmail App Password

### Step 1: Enable 2-Factor Authentication (if not already enabled)

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (you'll need your phone)

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. You may need to sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Enter: `Shining Star United Tournament`
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - Remove spaces when copying: `abcdefghijklmnop`

### Step 3: Update Configuration Files

Update the `SMTP_PASSWORD` in both files:

#### File: `backend/.env`
```env
SMTP_PASSWORD=your_new_app_password_here
```

#### File: `backend/.env.production`
```env
SMTP_PASSWORD=your_new_app_password_here
```

### Step 4: Restart the Server

```bash
# Stop current servers
./stop.sh

# Start with new configuration
./dev.sh
```

### Step 5: Test Email

Run the test script:
```bash
python3 test-email.py
```

Or test by:
1. Registering a new team with your email
2. Uploading payment proof
3. Checking your inbox for confirmation email

## Alternative: Use Different Email Service

If you don't want to use Gmail, you can use other SMTP services:

### Option 1: Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_password
SMTP_FROM=your_email@outlook.com
```

### Option 2: SendGrid (Recommended for Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM=your_verified_sender@yourdomain.com
```

### Option 3: Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your_mailgun_password
SMTP_FROM=noreply@your-domain.mailgun.org
```

## Testing Without Email (Development Only)

If you want to skip email for now during development, you can:

1. Leave SMTP_HOST empty in `backend/.env`:
   ```env
   SMTP_HOST=
   ```

2. The application will continue to work, but emails won't be sent
3. You'll see this in logs: `"SMTP not configured — skipping email"`

## Quick Test Commands

### Test SMTP Connection Only
```bash
python3 test-email.py
# Choose 'n' when asked to send test email
```

### Send Test Email
```bash
python3 test-email.py
# Choose 'y' and enter your email address
```

### Check Backend Logs
Watch the backend terminal for email-related messages:
- ✅ Success: `"Email sent to user@example.com: ..."`
- ⚠️ Skipped: `"SMTP not configured — skipping email"`
- ❌ Error: `"Failed to send email to user@example.com: ..."`

## Current Configuration

**Account**: sarlongkiteron484@gmail.com  
**SMTP Host**: smtp.gmail.com  
**Port**: 587  
**TLS**: Enabled  
**Status**: ❌ Authentication failing

## Next Steps

1. ✅ Generate new Gmail app password (see Step 2 above)
2. ✅ Update `backend/.env` and `backend/.env.production`
3. ✅ Restart servers: `./stop.sh && ./dev.sh`
4. ✅ Test: `python3 test-email.py`

## Need Help?

If you continue to have issues:
1. Verify 2FA is enabled on the Gmail account
2. Try generating a new app password
3. Check if the Gmail account has any security alerts
4. Consider using a different email service (SendGrid, Mailgun, etc.)
5. For development, you can disable emails by leaving `SMTP_HOST` empty
