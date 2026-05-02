# Brevo (Sendinblue) SMTP Setup Guide

## Why Brevo?

✅ **Free tier**: 300 emails/day  
✅ **No credit card required** for free tier  
✅ **Easy setup**: No app passwords needed  
✅ **Reliable**: Better deliverability than Gmail  
✅ **Professional**: Designed for transactional emails  

## Step-by-Step Setup

### Step 1: Create Brevo Account (if you don't have one)

1. Go to: https://app.brevo.com/account/register
2. Sign up with your email
3. Verify your email address
4. Complete the onboarding

### Step 2: Get Your SMTP Credentials

1. **Log in to Brevo**: https://app.brevo.com/
2. **Click your name** (top right corner)
3. **Select "SMTP & API"**
4. **Click the "SMTP" tab**

You'll see:
```
SMTP server: smtp-relay.brevo.com
Port: 587
Login: your_email@example.com
```

### Step 3: Create SMTP Key

1. In the SMTP tab, click **"Create a new SMTP key"**
2. **Name**: `Shining Star Tournament`
3. Click **"Generate"**
4. **Copy the key** - it looks like: `xsmtpsib-a1b2c3d4e5f6g7h8...`
   - ⚠️ Save it somewhere safe - you can't see it again!

### Step 4: Verify Your Sender Email

**Important**: Brevo requires you to verify the email address you'll send from.

1. Go to **"Senders & IP"** → **"Senders"** (left sidebar)
2. Click **"Add a sender"**
3. Enter your email address (e.g., `sarlongkiteron484@gmail.com`)
4. Click **"Add"**
5. **Check your email** for verification link
6. **Click the verification link**
7. Wait for approval (usually instant)

### Step 5: Update Configuration Files

Once you have:
- ✅ SMTP key (from Step 3)
- ✅ Verified sender email (from Step 4)

**Tell me these 2 things and I'll configure everything!**

Or update manually:

#### File: `backend/.env`
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=your_brevo_login_email@example.com
SMTP_PASSWORD=xsmtpsib-your_actual_smtp_key_here
SMTP_FROM=your_verified_sender@example.com
```

#### File: `backend/.env.production`
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=your_brevo_login_email@example.com
SMTP_PASSWORD=xsmtpsib-your_actual_smtp_key_here
SMTP_FROM=your_verified_sender@example.com
```

### Step 6: Restart Servers

```bash
./stop.sh
./dev.sh
```

### Step 7: Test Email

```bash
python3 test-email.py
```

Or register a team with your email and check your inbox!

## Configuration Details

### SMTP Settings for Brevo

| Setting | Value |
|---------|-------|
| **Host** | `smtp-relay.brevo.com` |
| **Port** | `587` (TLS) or `465` (SSL) |
| **TLS** | `true` |
| **User** | Your Brevo login email |
| **Password** | Your SMTP key (starts with `xsmtpsib-`) |
| **From** | Your verified sender email |

### Example Configuration

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=john@example.com
SMTP_PASSWORD=xsmtpsib-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
SMTP_FROM=noreply@example.com
```

## Testing

### Test 1: SMTP Connection
```bash
python3 test-email.py
# Choose 'n' to just test connection
```

Expected output:
```
✓ Connected to SMTP server
✓ EHLO successful
✓ TLS encryption enabled
✓ Authentication successful
✅ SMTP connection test PASSED!
```

### Test 2: Send Test Email
```bash
python3 test-email.py
# Choose 'y' and enter your email
```

Check your inbox (and spam folder) for the test email.

### Test 3: Register a Team
1. Go to http://localhost:5173
2. Register a new team with your email
3. Upload payment proof
4. Check your inbox for confirmation email

### Test 4: Approve Registration
1. Go to http://localhost:5173/admin
2. Login: admin@example.com / admin123
3. Approve a registration
4. Check the team manager's email for approval notification

## Troubleshooting

### Error: "Username and Password not accepted"

**Causes**:
- SMTP key is incorrect
- SMTP key was deleted/regenerated
- Wrong login email

**Fix**:
1. Go to Brevo → SMTP & API → SMTP
2. Generate a new SMTP key
3. Update `backend/.env` with new key
4. Restart servers

### Error: "Sender not verified"

**Causes**:
- Sender email not verified in Brevo
- Using different email than verified

**Fix**:
1. Go to Brevo → Senders & IP → Senders
2. Verify your sender email
3. Use the same email in `SMTP_FROM`

### Emails Going to Spam

**Solutions**:
1. **Verify your domain** in Brevo (if using custom domain)
2. **Add SPF/DKIM records** (Brevo provides these)
3. **Warm up your sender** (start with small volumes)
4. **Avoid spam trigger words** in subject lines

### Rate Limits

**Free tier**: 300 emails/day

If you need more:
- **Starter plan**: $25/month for 20,000 emails/month
- **Business plan**: $65/month for 40,000 emails/month

For this tournament app, free tier should be sufficient!

## Brevo Dashboard

Monitor your emails:
1. Go to: https://app.brevo.com/
2. Click **"Statistics"** → **"Email"**
3. See:
   - Emails sent
   - Delivery rate
   - Open rate
   - Bounce rate

## Security Best Practices

1. ✅ **Never commit** SMTP keys to git (already in .gitignore)
2. ✅ **Rotate keys** periodically
3. ✅ **Use different keys** for dev and production
4. ✅ **Monitor usage** in Brevo dashboard
5. ✅ **Set up alerts** for delivery issues

## What I Need From You

To complete the setup, tell me:

1. **Your Brevo SMTP key** (starts with `xsmtpsib-`)
2. **Your verified sender email** (the email you verified in Brevo)

I'll update the configuration and test it immediately!

## Alternative: Manual Setup

If you prefer to do it yourself:

1. Follow Steps 1-4 above
2. Edit `backend/.env` and `backend/.env.production`
3. Replace the placeholder values with your actual credentials
4. Run: `./stop.sh && ./dev.sh`
5. Test: `python3 test-email.py`

## Support

- **Brevo Documentation**: https://developers.brevo.com/docs
- **SMTP Guide**: https://help.brevo.com/hc/en-us/articles/209467485
- **Support**: https://help.brevo.com/

---

**Ready to configure?** Give me your SMTP key and sender email! 🚀
