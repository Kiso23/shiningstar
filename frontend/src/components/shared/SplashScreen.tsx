import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, X } from 'lucide-react'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [dragY, setDragY] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    setTimeout(onDone, 300)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: dragY }}
          exit={{ y: -1000, opacity: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 500) {
              handleDismiss()
            } else {
              setDragY(0)
            }
          }}
          drag="y"
          dragElastic={0.15}
          dragConstraints={{ top: -300, bottom: 0 }}
          className="fixed inset-0 z-[9999] overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black"
            animate={{ opacity: dragY < -150 ? 0.2 : 1 }}
          />

          {/* Welcome Image */}
          <motion.div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.img
              src="/welcome-splash.png"
              alt="SSU Welcome"
              className="w-full h-full object-cover"
              initial={{ scale: 1 }}
              animate={{ scale: dragY < -150 ? 1.08 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Gradient Overlay - fade out on drag */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
              animate={{ opacity: dragY < -150 ? 0.1 : 1 }}
            />
          </motion.div>

          {/* Close Button */}
          <motion.button
            onClick={handleDismiss}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          {/* Hint - Swipe Up */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-3"
              >
                <p className="text-white text-sm font-bold text-center px-4 drop-shadow-lg">
                  Swipe or scroll up to enter
                </p>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-green-400 drop-shadow-lg"
                >
                  <ChevronUp className="w-7 h-7" strokeWidth={3} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-green-500 to-green-400 origin-left"
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: dragY < -150 ? 1 : Math.min(Math.abs(dragY) / 150, 1),
            }}
            transition={{ type: 'spring', stiffness: 200 }}
          />

          {/* Drag Indicator - shows how much to drag */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
            animate={{ opacity: dragY < -50 ? 0 : 0.6 }}
          >
            <motion.div
              animate={{ y: dragY < -100 ? -20 : 0 }}
              className="text-white text-xs font-bold drop-shadow-lg text-center"
            >
              {dragY < -150 ? '✓ Release to enter' : 'Drag to enter'}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
