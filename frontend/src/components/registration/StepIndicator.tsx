import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const STEPS = [
  { label: 'Team Details' },
  { label: 'Players' },
  { label: 'Payment' },
  { label: 'Confirm' },
]

interface StepIndicatorProps {
  currentStep: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 z-0" />
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {STEPS.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isCompleted
                    ? '#22c55e'
                    : isActive
                    ? '#f97316'
                    : 'rgba(255,255,255,0.05)',
                  borderColor: isCompleted
                    ? '#22c55e'
                    : isActive
                    ? '#f97316'
                    : 'rgba(255,255,255,0.1)',
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm"
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                ) : (
                  <span className={isActive ? 'text-white' : 'text-gray-600'}>{stepNum}</span>
                )}
              </motion.div>
              <span
                className={`text-xs font-medium hidden sm:block transition-colors ${
                  isActive ? 'text-orange-400' : isCompleted ? 'text-green-400' : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
