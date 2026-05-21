# 💳 Dual Payment System - Razorpay + Manual UPI

## Overview

The ShiningStars registration system now supports **two payment methods**:

1. **Razorpay** - Automatic payment verification (recommended)
2. **Manual UPI** - Screenshot upload (fallback option)

Users can choose their preferred payment method during registration.

---

## 🎯 Features

### Razorpay Payment
- ✅ Instant payment verification
- ✅ Secure payment gateway
- ✅ Automatic status update
- ✅ No manual admin review needed
- ✅ Recommended option

### Manual UPI Payment
- ✅ QR code for easy scanning
- ✅ Screenshot upload
- ✅ Manual admin verification
- ✅ Fallback option
- ✅ Works without Razorpay setup

---

## 🚀 Implementation

### Frontend Changes

**File**: `frontend/src/components/registration/PaymentStep.tsx`

**New Features**:
- Payment method selection screen
- Razorpay integration with checkout
- Manual UPI with QR code
- Success modal for both methods
- Auto-redirect after payment

**New State**:
```typescript
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
```

**New Handlers**:
- `handleRazorpayPayment()` - Initiates Razorpay checkout
- `handleUPIPayment()` - Uploads UPI screenshot

### Backend Changes

**New Files**:
- `backend/app/models/payment.py` - RazorpayPayment model
- `backend/app/services/razorpay_service.py` - Razorpay integration

**New Endpoints**:
- `POST /registrations/{registration_id}/razorpay-order` - Create payment order
- `POST /registrations/{registration_id}/verify-payment` - Verify payment

**New Dependencies**:
- `razorpay==1.4.1` - Razorpay Python SDK

---

## 🔧 Configuration

### Frontend Setup

1. **Add Razorpay Key to `.env`**:
```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
```

2. **Get your key from**: https://dashboard.razorpay.com/app/keys

### Backend Setup

1. **Add Razorpay Keys to `.env`**:
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

2. **Install dependencies**:
```bash
pip install razorpay==1.4.1
```

3. **Run database migration** (if needed):
```bash
# Create RazorpayPayment table
alembic upgrade head
```

---

## 💰 Payment Flow

### Razorpay Flow

```
User selects "Razorpay Payment"
         ↓
Frontend requests order creation
         ↓
Backend creates Razorpay order
         ↓
Razorpay checkout opens
         ↓
User completes payment
         ↓
Frontend verifies signature
         ↓
Backend updates payment status
         ↓
✅ Success modal appears
         ↓
Auto-redirect to confirmation
```

### Manual UPI Flow

```
User selects "Manual UPI Payment"
         ↓
Shows QR code + UPI ID
         ↓
User scans QR code
         ↓
User uploads screenshot
         ↓
Frontend uploads to backend
         ↓
Backend stores screenshot
         ↓
✅ Success modal appears
         ↓
Auto-redirect to confirmation
         ↓
Admin reviews screenshot later
```

---

## 🔐 Security

### Razorpay Security
- ✅ HMAC-SHA256 signature verification
- ✅ Order ID validation
- ✅ Payment ID verification
- ✅ Secure API communication

### Manual UPI Security
- ✅ File type validation (JPEG/PNG only)
- ✅ File size limit (5MB max)
- ✅ Virus scanning (optional)
- ✅ Admin manual verification

---

## 📊 Database Schema

### RazorpayPayment Table

```sql
CREATE TABLE razorpay_payments (
    id UUID PRIMARY KEY,
    team_id UUID FOREIGN KEY,
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(256),
    amount FLOAT,
    currency VARCHAR(3),
    status VARCHAR(20),
    created_at DATETIME,
    updated_at DATETIME
);
```

### Payment Status Values
- `created` - Order created, awaiting payment
- `authorized` - Payment authorized
- `captured` - Payment captured (successful)
- `failed` - Payment failed
- `refunded` - Payment refunded

---

## 🧪 Testing

### Test Razorpay Payment

1. **Use test credentials**:
   - Key ID: `rzp_test_YOUR_TEST_KEY`
   - Key Secret: `your-test-secret`

2. **Test cards**:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`

3. **Test flow**:
   - Select "Razorpay Payment"
   - Click "Pay with Razorpay"
   - Use test card
   - Verify success modal

### Test Manual UPI

1. **Select "Manual UPI Payment"**
2. **Upload test screenshot**
3. **Verify success modal**
4. **Check admin dashboard for pending verification**

---

## 📱 User Experience

### Payment Method Selection

Users see two clear options:

**Option 1: Razorpay Payment** (Recommended)
- Instant verification
- Secure payment gateway
- No manual review needed

**Option 2: Manual UPI Payment**
- Scan QR code
- Upload screenshot
- Manual admin verification

### Success Experience

After payment:
1. Success modal appears with checkmark
2. 3-second countdown timer
3. Auto-redirect to confirmation page
4. Option to skip countdown

---

## 🔄 Admin Dashboard

### Razorpay Payments
- ✅ Automatically verified
- ✅ Status: "payment_verified"
- ✅ No action needed
- ✅ Registration auto-approved

### Manual UPI Payments
- ⏳ Pending review
- ⏳ Status: "payment_submitted"
- ⏳ Admin must verify screenshot
- ⏳ Admin approves/rejects

---

## 🚨 Error Handling

### Razorpay Errors

**Order Creation Failed**
- Message: "Failed to create payment order"
- Action: Retry or use manual UPI

**Payment Verification Failed**
- Message: "Payment verification failed"
- Action: Contact support

**Invalid Signature**
- Message: "Payment verification failed"
- Action: Security issue, contact support

### Manual UPI Errors

**File Upload Failed**
- Message: "Upload failed. Please try again."
- Action: Retry upload

**Invalid File Type**
- Message: "Only JPEG/PNG files allowed"
- Action: Upload correct file type

**File Too Large**
- Message: "File size exceeds 5MB limit"
- Action: Compress and retry

---

## 📈 Analytics

### Razorpay Metrics
- Total Razorpay payments
- Success rate
- Average payment time
- Failed payment reasons

### Manual UPI Metrics
- Total manual payments
- Pending verification count
- Approval rate
- Average verification time

---

## 🔄 Refunds

### Razorpay Refunds
- Initiated from Razorpay dashboard
- Automatic status update
- Refund confirmation email

### Manual UPI Refunds
- Manual bank transfer
- Admin must track
- Manual email notification

---

## 🛠️ Troubleshooting

### Razorpay Not Working

**Issue**: Razorpay button not appearing
- Check: `VITE_RAZORPAY_KEY_ID` in frontend `.env`
- Check: Razorpay script loading in browser console
- Solution: Verify key ID is correct

**Issue**: Payment verification fails
- Check: `RAZORPAY_KEY_SECRET` in backend `.env`
- Check: Signature verification logic
- Solution: Verify key secret is correct

### Manual UPI Not Working

**Issue**: QR code not displaying
- Check: `/qr-payment.png` exists in public folder
- Check: Image path is correct
- Solution: Verify image file exists

**Issue**: Screenshot upload fails
- Check: File size < 5MB
- Check: File type is JPEG/PNG
- Check: Upload directory has write permissions
- Solution: Check file and permissions

---

## 📚 API Documentation

### Create Razorpay Order

**Endpoint**: `POST /api/registrations/{registration_id}/razorpay-order`

**Response**:
```json
{
  "id": "order_1234567890",
  "amount": 80100,
  "currency": "INR"
}
```

### Verify Payment

**Endpoint**: `POST /api/registrations/{registration_id}/verify-payment`

**Request**:
```json
{
  "razorpay_order_id": "order_1234567890",
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_signature": "signature_hash"
}
```

**Response**:
```json
{
  "message": "Payment verified successfully",
  "status": "payment_verified",
  "registration_id": "REG-12345-ABCDE"
}
```

---

## 🎯 Best Practices

### For Users
1. ✅ Use Razorpay for instant verification
2. ✅ Use Manual UPI as fallback
3. ✅ Keep payment screenshot for records
4. ✅ Check email for confirmation

### For Admins
1. ✅ Monitor Razorpay dashboard
2. ✅ Verify manual UPI screenshots promptly
3. ✅ Keep refund records
4. ✅ Track payment metrics

### For Developers
1. ✅ Keep Razorpay keys secure
2. ✅ Validate all signatures
3. ✅ Log payment events
4. ✅ Monitor error rates

---

## 🔐 Security Checklist

- ✅ Razorpay keys in environment variables
- ✅ HMAC signature verification enabled
- ✅ File upload validation
- ✅ File size limits enforced
- ✅ File type validation
- ✅ HTTPS only in production
- ✅ CORS properly configured
- ✅ Rate limiting on payment endpoints

---

## 📞 Support

### Razorpay Support
- Website: https://razorpay.com
- Dashboard: https://dashboard.razorpay.com
- Documentation: https://razorpay.com/docs

### Manual UPI Support
- Contact admin for verification status
- Email: admin@shiningstarunited.com

---

## 🚀 Deployment

### Frontend Deployment
1. Add `VITE_RAZORPAY_KEY_ID` to environment
2. Build: `npm run build`
3. Deploy dist folder

### Backend Deployment
1. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to environment
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `alembic upgrade head`
4. Deploy application

---

## 📊 Implementation Status

| Component | Status | Details |
|-----------|--------|---------|
| Frontend | ✅ Complete | Dual payment UI |
| Backend | ✅ Complete | Razorpay integration |
| Database | ✅ Complete | Payment model |
| Documentation | ✅ Complete | This guide |
| Testing | ✅ Ready | Test credentials available |
| Deployment | ✅ Ready | Environment variables needed |

---

**Implementation Date**: May 22, 2026
**Status**: ✅ Complete and Ready
**Build Status**: ✅ Passing
