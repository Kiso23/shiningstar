import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2, Smartphone, CheckCircle, Sparkles, CreditCard } from 'lucide-react'
import FileUpload from '../shared/FileUpload'
import { uploadPayment } from '../../api/registrations'
import { extractErrorMessage } from '../../api/errors'
import { useRegistrationStore } from '../../store/registrationStore'

const UPI_ID = 'sarlongkisarlongki143@okhdfcbank'
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_YOUR_KEY_ID'

interface Props {
  onNext: () => void
  onBack: () => void
}

type PaymentMethod = 'razorpay' | 'upi' | null

export default function PaymentStep({ onNext, onBack }: Props) {
  const { registrationId } = useRegistrationStore()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(3)

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-redirect countdown effect
  useEffect(() => {
    if (!paymentSuccess) return
    
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onNext()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentSuccess, onNext])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleRazorpayPayment = async () => {
    if (!registrationId) return

    setLoading(true)
    setServerError(null)

    try {
      // Create order on backend
      const response = await fetch(`/api/registrations/${registrationId}/razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to create payment order')
      }

      const orderData = await response.json()

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Shining Star United',
        description: 'Team Registration Fee',
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(
              `/api/registrations/${registrationId}/verify-payment`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            )

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }

            setPaymentSuccess(true)
          } catch (err: any) {
            setServerError('Payment verification failed. Please contact support.')
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: 'Team Manager',
          email: 'manager@team.com',
        },
        theme: {
          color: '#f97316',
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setServerError(extractErrorMessage(err, 'Failed to initiate payment. Please try again.'))
      setLoading(false)
    }
  }

  const handleUPIPayment = async () => {
    if (!file) {
      setFileError('Please upload your payment screenshot before continuing.')
      return
    }
    if (!registrationId) return

    setLoading(true)
    setServerError(null)
    try {
      await uploadPayment(registrationId, file)
      setPaymentSuccess(true)
    } catch (err: any) {
      setServerError(extractErrorMessage(err, 'Upload failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Success Modal with Auto-Redirect */}
      <AnimatePresence>
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-sm rounded-2xl p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 25px 50px rgba(34, 197, 94, 0.2)',
              }}
            >
              {/* Animated success icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-green-500/30 blur-xl"
                  />
                  <div className="relative w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                </div>
              </motion.div>

              {/* Success message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-white mb-2">Payment Received!</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Your payment has been verified successfully. Redirecting to confirmation...
                </p>
              </motion.div>

              {/* Countdown timer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-400 text-sm">Redirecting in</span>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="inline-block"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-2 border-orange-400/50">
                    <span className="text-2xl font-bold text-white">{redirectCountdown}</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Info box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left"
              >
                <p className="text-blue-300 text-xs leading-relaxed">
                  <strong>Next Step:</strong> Your registration is confirmed! You'll receive an email confirmation shortly.
                </p>
              </motion.div>

              {/* Skip button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onNext}
                className="mt-6 text-gray-400 hover:text-gray-300 text-xs transition-colors"
              >
                Skip waiting →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Payment Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
          <p className="text-gray-400">Choose your preferred payment method to pay ₹801</p>
        </div>

        {/* Payment Method Selection */}
        {!paymentMethod ? (
          <div className="space-y-4 mb-8">
            {/* Razorpay Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentMethod('razorpay')}
              className="w-full p-6 rounded-2xl border-2 border-orange-500/30 hover:border-orange-500/60 bg-orange-500/5 hover:bg-orange-500/10 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <CreditCard className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-1">Razorpay Payment</h3>
                  <p className="text-gray-400 text-sm">Instant verification • Secure payment gateway</p>
                </div>
                <div className="text-green-400 text-sm font-semibold">Recommended</div>
              </div>
            </motion.button>

            {/* UPI Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentMethod('upi')}
              className="w-full p-6 rounded-2xl border-2 border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5 hover:bg-blue-500/10 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-1">Manual UPI Payment</h3>
                  <p className="text-gray-400 text-sm">Scan QR code • Upload screenshot</p>
                </div>
              </div>
            </motion.button>
          </div>
        ) : null}

        {/* Razorpay Payment Method */}
        {paymentMethod === 'razorpay' && (
          <div className="space-y-6">
            <div className="glass-card p-6 text-center">
              <p className="text-white font-semibold mb-4">Ready to pay with Razorpay?</p>
              <p className="text-gray-400 text-sm mb-6">
                Click the button below to proceed to secure payment gateway
              </p>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
                <p className="text-orange-300 text-sm">
                  Amount: <span className="font-bold text-lg">₹801</span>
                </p>
              </div>
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {serverError}
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => setPaymentMethod(null)}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back
              </motion.button>
              <motion.button
                type="button"
                onClick={handleRazorpayPayment}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay with Razorpay →
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}

        {/* UPI Payment Method */}
        {paymentMethod === 'upi' && (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="glass-card p-6 text-center">
              <p className="text-white font-semibold mb-1">Scan QR Code to Pay</p>
              <p className="text-gray-500 text-xs mb-4">Sarlongki Teron · Any UPI app · ₹801</p>
              <div className="mx-auto w-56 h-56 rounded-2xl overflow-hidden bg-white p-2 shadow-lg shadow-orange-500/10">
                <img
                  src="/qr-payment.png"
                  alt="UPI QR Code - Scan to pay ₹801"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <code className="text-orange-400 font-mono text-sm bg-orange-500/10 px-3 py-1.5 rounded-lg">
                  {UPI_ID}
                </code>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={copyUpiId}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  aria-label="Copy UPI ID"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Smartphone className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              <p className="text-gray-600 text-xs mt-2">Tap the icon to copy UPI ID</p>
            </div>

            {/* Upload */}
            <div>
              <label className="label">Upload Payment Screenshot *</label>
              <FileUpload
                accept="image/jpeg,image/png"
                maxSizeBytes={5 * 1024 * 1024}
                label="Upload payment screenshot (JPEG/PNG, max 5 MB)"
                onFileSelect={(f) => {
                  setFile(f)
                  if (f) setFileError(null)
                }}
                retainedFile={file}
                error={fileError || undefined}
              />
            </div>

            {/* Server error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {serverError}
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => setPaymentMethod(null)}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back
              </motion.button>
              <motion.button
                type="button"
                onClick={handleUPIPayment}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Submit Registration →'
                )}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}
