# 🚀 Razorpay Setup Guide

## Quick Start (5 minutes)

### Step 1: Get Razorpay Keys

1. Go to https://razorpay.com
2. Sign up or log in
3. Go to Dashboard → Settings → API Keys
4. Copy your **Key ID** and **Key Secret**

### Step 2: Frontend Setup

1. Open `frontend/.env`
2. Add your Razorpay Key ID:
```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
```

### Step 3: Backend Setup

1. Open `backend/.env`
2. Add your Razorpay credentials:
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Step 4: Install Dependencies

```bash
# Backend
cd backend
pip install razorpay==1.4.1

# Or update all dependencies
pip install -r requirements.txt
```

### Step 5: Test

1. Start the application
2. Go to registration → payment step
3. Select "Razorpay Payment"
4. Click "Pay with Razorpay"
5. Use test card: `4111 1111 1111 1111`

---

## 🧪 Testing

### Test Credentials

**For Development**:
```
Key ID: rzp_test_YOUR_TEST_KEY
Key Secret: your-test-secret
```

**Test Cards**:
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`
- Recurring: `4111 1111 1111 1111`

### Test Flow

1. Select "Razorpay Payment"
2. Click "Pay with Razorpay"
3. Enter test card details
4. Complete payment
5. Verify success modal
6. Check database for payment record

---

## 🔄 Switching to Production

### Step 1: Get Production Keys

1. Go to Razorpay Dashboard
2. Switch to **Live Mode**
3. Get your **Live Key ID** and **Live Key Secret**

### Step 2: Update Environment

**Frontend** (`frontend/.env`):
```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
```

**Backend** (`backend/.env`):
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=your-live-key-secret
```

### Step 3: Deploy

1. Rebuild frontend: `npm run build`
2. Deploy to production
3. Verify payment flow works

---

## 🛠️ Troubleshooting

### Razorpay Button Not Showing

**Problem**: "Razorpay Payment" option not visible

**Solutions**:
1. Check `VITE_RAZORPAY_KEY_ID` is set in `.env`
2. Rebuild frontend: `npm run build`
3. Clear browser cache
4. Check browser console for errors

### Payment Verification Fails

**Problem**: "Payment verification failed" error

**Solutions**:
1. Check `RAZORPAY_KEY_SECRET` is correct in backend `.env`
2. Verify signature verification logic
3. Check backend logs for errors
4. Ensure payment was actually processed

### Razorpay Checkout Doesn't Open

**Problem**: Clicking "Pay with Razorpay" does nothing

**Solutions**:
1. Check Razorpay script is loaded (browser console)
2. Verify `VITE_RAZORPAY_KEY_ID` is correct
3. Check for JavaScript errors in console
4. Try different browser

### Payment Status Not Updating

**Problem**: Payment succeeds but status doesn't update

**Solutions**:
1. Check backend is running
2. Verify database connection
3. Check backend logs
4. Manually verify payment in Razorpay dashboard

---

## 📊 Monitoring

### Check Payment Status

**In Razorpay Dashboard**:
1. Go to Transactions
2. Find your payment
3. Check status and details

**In Database**:
```sql
SELECT * FROM razorpay_payments 
WHERE status = 'captured';
```

### View Logs

**Frontend**:
- Open browser console (F12)
- Look for payment-related messages

**Backend**:
- Check application logs
- Look for payment verification messages

---

## 🔐 Security Tips

1. ✅ Never commit `.env` files
2. ✅ Keep keys secret
3. ✅ Use environment variables
4. ✅ Verify signatures always
5. ✅ Use HTTPS in production
6. ✅ Monitor for suspicious activity

---

## 📞 Support

### Razorpay Support
- Website: https://razorpay.com
- Dashboard: https://dashboard.razorpay.com
- Documentation: https://razorpay.com/docs
- Support: support@razorpay.com

### Common Issues

**Issue**: "Invalid API Key"
- Solution: Check key ID is correct

**Issue**: "Signature verification failed"
- Solution: Check key secret is correct

**Issue**: "Order not found"
- Solution: Check order ID is correct

---

## ✅ Checklist

- [ ] Razorpay account created
- [ ] API keys obtained
- [ ] Frontend `.env` updated
- [ ] Backend `.env` updated
- [ ] Dependencies installed
- [ ] Application rebuilt
- [ ] Test payment successful
- [ ] Production keys ready
- [ ] Deployment planned

---

## 🎯 Next Steps

1. ✅ Complete setup above
2. 📋 Test with test credentials
3. 📋 Switch to production keys
4. 📋 Deploy to production
5. 📋 Monitor payments
6. 📋 Handle refunds as needed

---

**Setup Time**: ~5 minutes
**Difficulty**: Easy
**Status**: Ready to implement
