import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import StepIndicator from '../components/registration/StepIndicator'
import TeamDetailsStep from '../components/registration/TeamDetailsStep'
import PlayerDetailsStep from '../components/registration/PlayerDetailsStep'
import PaymentStep from '../components/registration/PaymentStep'
import { useRegistrationStore } from '../store/registrationStore'

function TermsModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-orange-500/10">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
          </div>
          <p className="text-gray-400 text-sm">Please read carefully before registering</p>
        </div>

        {/* Terms Content */}
        <div className="p-6 space-y-4">
          {/* Payment Terms */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <h3 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
              <span>💰</span> Payment Policy
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                Registration fee of <strong className="text-white">₹801 per team</strong> must be paid in advance via UPI.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <strong className="text-red-400">No refunds</strong> will be issued once payment is made, under any circumstances.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                Payment proof (screenshot) must be uploaded during registration.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                Registration is only confirmed after admin approval.
              </li>
            </ul>
          </div>

          {/* Tournament Rules */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-orange-400 font-bold text-sm mb-2 flex items-center gap-2">
              <span>⚽</span> Tournament Rules
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                Each team must have a minimum of 7 players and maximum of 15 players.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                All players must be present at the venue on the scheduled match day.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                The organiser's decision on all matters is final and binding.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                Teams must arrive at least 30 minutes before their scheduled match.
              </li>
            </ul>
          </div>

          {/* Registration Terms */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
              <span>📋</span> Registration Terms
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                All information provided must be accurate and truthful.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                The organiser reserves the right to reject any registration.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                Registered teams will receive a confirmation email with their Registration ID.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                Maximum <strong className="text-white">32 teams</strong> will be accepted. Register early!
              </li>
            </ul>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group mt-4">
            <div
              onClick={() => setChecked(!checked)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                checked
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-white/30 group-hover:border-orange-500/50'
              }`}
            >
              {checked && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-300 text-sm">
              I have read and agree to the Terms & Conditions. I understand that the registration fee is{' '}
              <strong className="text-red-400">non-refundable</strong> and payment must be made in advance.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-all text-sm font-medium"
          >
            <XCircle className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={!checked}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              checked
                ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            I Agree & Continue
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { currentStep, registrationId, setStep } = useRegistrationStore()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTerms, setShowTerms] = useState(true)

  const goNext = () => setStep(currentStep + 1)
  const goBack = () => setStep(currentStep - 1)

  const handleComplete = () => {
    if (registrationId) {
      navigate(`/confirmation/${registrationId}`)
    }
  }

  const handleDecline = () => {
    navigate('/')
  }

  const handleAccept = () => {
    setTermsAccepted(true)
    setShowTerms(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Terms Modal */}
      <AnimatePresence>
        {showTerms && (
          <TermsModal onAccept={handleAccept} onDecline={handleDecline} />
        )}
      </AnimatePresence>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Shining Star United Hamren"
            className="w-8 h-8 rounded-full object-cover border border-orange-500/40"
          />
          <span className="font-bold text-white text-sm">Shining Star United</span>
        </div>
      </motion.header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-black text-white mb-2">
              Team <span className="gradient-text">Registration</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Step {currentStep} of 4 — {
                currentStep === 1 ? 'Team Details' :
                currentStep === 2 ? 'Player Roster' :
                currentStep === 3 ? 'Payment' : 'Confirmation'
              }
            </p>
          </motion.div>

          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <StepIndicator currentStep={currentStep} />
          </motion.div>

          {/* Step content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 sm:p-8"
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <TeamDetailsStep key="step1" onNext={goNext} />
              )}
              {currentStep === 2 && (
                <PlayerDetailsStep key="step2" onNext={goNext} onBack={goBack} />
              )}
              {currentStep === 3 && (
                <PaymentStep key="step3" onNext={handleComplete} onBack={goBack} />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
