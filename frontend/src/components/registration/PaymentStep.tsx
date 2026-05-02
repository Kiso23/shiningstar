import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2, Smartphone, CheckCircle, Info } from 'lucide-react'
import FileUpload from '../shared/FileUpload'
import { uploadPayment } from '../../api/registrations'
import { extractErrorMessage } from '../../api/errors'
import { useRegistrationStore } from '../../store/registrationStore'

const UPI_ID = 'shiningstarunited@upi'
const UPI_APPS = [
  { name: 'Google Pay', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30', emoji: '🔵' },
  { name: 'PhonePe', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30', emoji: '🟣' },
  { name: 'Paytm', color: 'from-sky-500/20 to-sky-600/10 border-sky-500/30', emoji: '🔷' },
]

// Simple QR code placeholder (in production, use a real QR code library)
function QRCodePlaceholder() {
  return (
    <div
      className="w-48 h-48 bg-white rounded-2xl p-3 mx-auto"
      role="img"
      aria-label="UPI QR code for payment to Shining Star United"
    >
      <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center">
        <div className="grid grid-cols-7 gap-0.5 p-2">
          {Array.from({ length: 49 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${
                [0,1,2,3,4,5,6,7,14,21,28,35,42,43,44,45,46,47,48,
                 8,15,22,29,36,10,11,12,17,19,24,26,31,33,38,40].includes(i)
                  ? 'bg-white'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function PaymentStep({ onNext, onBack }: Props) {
  const { registrationId } = useRegistrationStore()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    if (!file) {
      setFileError('Please upload your payment screenshot before continuing.')
      return
    }
    if (!registrationId) return

    setLoading(true)
    setServerError(null)
    try {
      await uploadPayment(registrationId, file)
      onNext()
    } catch (err: any) {
      setServerError(extractErrorMessage(err, 'Upload failed. Please try again.'))
      // Retain the file so user doesn't need to re-select
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
        <p className="text-gray-400">Pay the registration fee via UPI and upload your screenshot.</p>
      </div>

      <div className="space-y-6">
        {/* Amount */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-5 text-center"
        >
          <p className="text-gray-400 text-sm mb-1">Registration Fee</p>
          <p className="text-4xl font-black gradient-text">₹801</p>
          <p className="text-gray-500 text-xs mt-1">One-time payment per team</p>
        </motion.div>

        {/* QR Code */}
        <div className="glass-card p-6 text-center">
          <p className="text-white font-semibold mb-4">Scan QR Code to Pay</p>
          <QRCodePlaceholder />
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
        </div>

        {/* Accepted UPI apps */}
        <div>
          <p className="text-sm text-gray-400 mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Accepted UPI apps
          </p>
          <div className="grid grid-cols-3 gap-3">
            {UPI_APPS.map(({ name, color, emoji }) => (
              <div
                key={name}
                className={`p-3 rounded-xl bg-gradient-to-br border text-center text-sm font-medium text-white ${color}`}
              >
                <div className="text-xl mb-1">{emoji}</div>
                {name}
              </div>
            ))}
          </div>
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
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary flex-1 py-4"
          >
            ← Back
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex-1 py-4"
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
    </motion.div>
  )
}
