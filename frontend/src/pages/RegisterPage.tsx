import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ArrowLeft } from 'lucide-react'
import StepIndicator from '../components/registration/StepIndicator'
import TeamDetailsStep from '../components/registration/TeamDetailsStep'
import PlayerDetailsStep from '../components/registration/PlayerDetailsStep'
import PaymentStep from '../components/registration/PaymentStep'
import { useRegistrationStore } from '../store/registrationStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { currentStep, registrationId, setStep } = useRegistrationStore()

  const goNext = () => setStep(currentStep + 1)
  const goBack = () => setStep(currentStep - 1)

  const handleComplete = () => {
    if (registrationId) {
      navigate(`/confirmation/${registrationId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
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
