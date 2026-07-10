import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Star, Home, Copy, ExternalLink } from 'lucide-react'
import { getStatus } from '../api/registrations'
import { useRegistrationStore } from '../store/registrationStore'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending Review', color: 'text-yellow-400', icon: Clock },
  payment_submitted: { label: 'Payment Submitted', color: 'text-blue-400', icon: Clock },
  approved: { label: 'Approved!', color: 'text-green-400', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-400', icon: Clock },
}

export default function ConfirmationPage() {
  const { registrationId } = useParams<{ registrationId: string }>()
  const navigate = useNavigate()
  const { reset } = useRegistrationStore()
  const [status, setStatus] = useState<string>('payment_submitted')
  const [teamName, setTeamName] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (registrationId) {
      getStatus(registrationId)
        .then((data) => {
          setStatus(data.status)
          setTeamName(data.team_name)
        })
        .catch(() => {})
    }
    return () => { reset() }
  }, [registrationId])

  const copyId = () => {
    if (registrationId) {
      navigator.clipboard.writeText(registrationId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.payment_submitted
  const StatusIcon = cfg.icon

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-gradient-radial from-green-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative inline-flex">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-green-500/20 blur-xl"
            />
            <div className="relative w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Confetti dots */}
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#eab308'][i % 5],
              left: `${20 + (i * 6)}%`,
              top: '10%',
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: [0, -60, 100], opacity: [1, 1, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h1 className="text-3xl font-black text-white mb-2">
            Registration <span className="gradient-text">Submitted!</span>
          </h1>
          {teamName && (
            <p className="text-gray-400 mb-6">
              <span className="text-orange-400 font-semibold">{teamName}</span> is in the queue!
            </p>
          )}

          {/* Registration ID */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <p className="text-gray-500 text-xs mb-2">Your Registration ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-orange-400 font-mono text-lg font-bold">{registrationId}</code>
              <button
                onClick={copyId}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Copy registration ID"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
            <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 text-left">
            <p className="text-blue-300 text-sm">
              <strong>What happens next?</strong> Our admin team will review your payment screenshot
              and approve your registration within 24 hours. Save your Registration ID for reference.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="btn-primary w-full py-3"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="btn-secondary w-full py-3"
            >
              Register Another Team
            </motion.button>
          </div>
        </motion.div>

        {/* Star branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex items-center justify-center gap-2 text-gray-600 text-sm"
        >
          <Star className="w-3.5 h-3.5 text-orange-500" fill="currentColor" />
          Shining Star United 2026
        </motion.div>
      </div>
    </div>
  )
}
