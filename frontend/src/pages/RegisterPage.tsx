import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Check } from 'lucide-react'
import { useState } from 'react'
import TeamDetailsStep from '../components/registration/TeamDetailsStep'
import PlayerDetailsStep from '../components/registration/PlayerDetailsStep'
import PaymentStep from '../components/registration/PaymentStep'
import { useRegistrationStore } from '../store/registrationStore'

const STEPS = [
  { label: 'Team Details', icon: '🏟️' },
  { label: 'Players', icon: '👥' },
  { label: 'Payment', icon: '💳' },
  { label: 'Confirm', icon: '✅' },
]

// ── Step Progress Bar ─────────────────────────────────────────────────────────
function StepBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full px-2">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10 z-0" />
        {/* Animated fill */}
        <motion.div
          className="absolute top-5 left-5 h-0.5 z-0"
          style={{ background: 'linear-gradient(90deg, #f97316, #fb923c)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {STEPS.map((step, i) => {
          const n = i + 1
          const done = n < currentStep
          const active = n === currentStep
          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  scale: active ? 1.2 : done ? 1 : 0.9,
                  boxShadow: active ? '0 0 20px rgba(249,115,22,0.6)' : 'none',
                }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${
                  done ? 'bg-green-500 border-green-500' :
                  active ? 'bg-orange-500 border-orange-500' :
                  'bg-white/5 border-white/15'
                }`}
              >
                {done ? (
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400 }}>
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                ) : (
                  <span className={active ? 'text-white' : 'text-gray-500'}>{n}</span>
                )}
              </motion.div>
              <span className={`text-xs font-semibold hidden sm:block transition-colors ${
                active ? 'text-orange-400' : done ? 'text-green-400' : 'text-gray-600'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Terms Modal ───────────────────────────────────────────────────────────────
function TermsModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0e1a0e 0%, #111f11 100%)', border: '1px solid rgba(249,115,22,0.2)' }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-orange-500/15">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-black text-white">Terms & Conditions</h2>
          </div>
          <p className="text-gray-500 text-sm ml-11">Please read carefully before registering</p>
        </div>

        <div className="p-6 space-y-4">
          {[
            { emoji: '💰', title: 'Payment Policy', color: 'red', items: [
              'Registration fee of ₹801 per team must be paid via UPI.',
              'No refunds once payment is made, under any circumstances.',
              'Payment proof (screenshot) must be uploaded during registration.',
              'Registration is confirmed only after admin approval.',
            ]},
            { emoji: '⚽', title: 'Tournament Rules', color: 'orange', items: [
              'Minimum 7 players, maximum 15 players per team.',
              'All players must be present at the venue on match day.',
              'The organiser\'s decision on all matters is final.',
              'Teams must arrive 30 minutes before their scheduled match.',
            ]},
            { emoji: '📋', title: 'Registration Terms', color: 'blue', items: [
              'All information provided must be accurate and truthful.',
              'The organiser reserves the right to reject any registration.',
              'Confirmed teams receive a Registration ID via email.',
              'Maximum 32 teams will be accepted — register early!',
            ]},
          ].map(({ emoji, title, color, items }) => (
            <div key={title} className={`rounded-xl p-4 border ${
              color === 'red' ? 'bg-red-500/8 border-red-500/20' :
              color === 'orange' ? 'bg-orange-500/8 border-orange-500/20' :
              'bg-blue-500/8 border-blue-500/20'
            }`}>
              <h3 className={`font-bold text-sm mb-3 flex items-center gap-2 ${
                color === 'red' ? 'text-red-400' : color === 'orange' ? 'text-orange-400' : 'text-blue-400'
              }`}>
                <span>{emoji}</span> {title}
              </h3>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      color === 'red' ? 'bg-red-400' : color === 'orange' ? 'bg-orange-400' : 'bg-blue-400'
                    }`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <label className="flex items-start gap-3 cursor-pointer group mt-2">
            <div onClick={() => setChecked(!checked)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                checked ? 'bg-orange-500 border-orange-500' : 'border-white/30 group-hover:border-orange-500/50'
              }`}>
              {checked && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-300 text-sm leading-relaxed">
              I have read and agree to the Terms & Conditions. I understand the registration fee is{' '}
              <strong className="text-red-400">non-refundable</strong>.
            </span>
          </label>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 text-gray-400 hover:text-white hover:border-white/30 transition-all text-sm font-medium">
            <XCircle className="w-4 h-4" /> Decline
          </button>
          <motion.button onClick={onAccept} disabled={!checked}
            whileHover={checked ? { scale: 1.02 } : {}}
            whileTap={checked ? { scale: 0.98 } : {}}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              checked ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/30' : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}>
            <CheckCircle className="w-4 h-4" /> I Agree & Continue
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const { currentStep, registrationId, setStep } = useRegistrationStore()
  const [showTerms, setShowTerms] = useState(true)

  const goNext = () => setStep(currentStep + 1)
  const goBack = () => setStep(currentStep - 1)
  const handleComplete = () => { if (registrationId) navigate(`/confirmation/${registrationId}`) }

  const stepLabels = ['Team Details', 'Player Roster', 'Payment', 'Confirmation']

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #080c08 0%, #0e1a0e 50%, #080c08 100%)' }}>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTerms && <TermsModal onAccept={() => setShowTerms(false)} onDecline={() => navigate('/')} />}
      </AnimatePresence>

      {/* Stadium video background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover" style={{ opacity: 0.12 }}>
          <source src="/stadium.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,12,8,0.92) 0%, rgba(14,26,14,0.88) 100%)' }} />
        {/* Floodlight glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <motion.header initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderBottomColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(8,12,8,0.8)', backdropFilter: 'blur(20px)' }}>
        <motion.button whileHover={{ x: -3 }} onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </motion.button>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SSU" className="w-8 h-8 rounded-full object-cover border border-orange-500/40" />
          <span className="font-bold text-white text-sm hidden sm:block">Shining Star United</span>
        </div>
      </motion.header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Team <span style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Registration</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Step {currentStep} of 4 — <span className="text-orange-400">{stepLabels[currentStep - 1]}</span>
            </p>
          </motion.div>

          {/* Step bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-8 px-2 py-5 rounded-2xl"
            style={{ backgroundColor: 'rgba(17,31,17,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
            <StepBar currentStep={currentStep} />
          </motion.div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.97 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="rounded-2xl p-6 sm:p-8"
              style={{ backgroundColor: 'rgba(17,31,17,0.85)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
            >
              {currentStep === 1 && <TeamDetailsStep key="step1" onNext={goNext} />}
              {currentStep === 2 && <PlayerDetailsStep key="step2" onNext={goNext} onBack={goBack} />}
              {currentStep === 3 && <PaymentStep key="step3" onNext={handleComplete} onBack={goBack} />}
            </motion.div>
          </AnimatePresence>

          {/* Step dots indicator (mobile) */}
          <div className="flex items-center justify-center gap-2 mt-6 sm:hidden">
            {STEPS.map((_, i) => (
              <motion.div key={i}
                animate={{ width: i + 1 === currentStep ? 24 : 8, backgroundColor: i + 1 < currentStep ? '#22c55e' : i + 1 === currentStep ? '#f97316' : 'rgba(255,255,255,0.15)' }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
