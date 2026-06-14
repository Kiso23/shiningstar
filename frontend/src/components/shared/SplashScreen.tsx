import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      setDismissed(true)
      setTimeout(onDone, 300)
    }, 6000)
    return () => clearTimeout(timer)
  }, [onDone])

  const handleDismiss = () => {
    setDismissed(true)
    setTimeout(onDone, 300)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
        >
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Welcome Image */}
            <img
              src="/welcome-splash.png"
              alt="SSU Welcome"
              className="w-full h-full object-cover"
            />

            {/* Close Button */}
            <motion.button
              onClick={handleDismiss}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-6 h-6 text-gray-900" />
            </motion.button>

            {/* Auto-dismiss Progress Bar */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 6, ease: 'linear' }}
              style={{ originX: 0 }}
            />

            {/* Click to Close Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <p className="text-white text-xs font-semibold">Click X or wait to continue</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

