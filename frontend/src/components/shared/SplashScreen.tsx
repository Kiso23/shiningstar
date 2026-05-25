import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')

  useEffect(() => {
    // enter → hold after 800ms
    const t1 = setTimeout(() => setPhase('hold'), 800)
    // hold → exit after 2200ms
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    // call onDone after exit animation (300ms)
    const t3 = setTimeout(() => onDone(), 2700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeIn' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 overflow-hidden"
        >
          {/* Stripe background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'repeating-linear-gradient(0deg, #c41e3a 0px, #c41e3a 12px, #1a0a0a 12px, #1a0a0a 24px)',
            }}
          />

          {/* Radial glow */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            >
              <img
                src="/logo.png"
                alt="Shining Star United"
                className="w-24 h-24 rounded-full object-cover border-4 border-orange-500 shadow-2xl shadow-orange-500/40"
              />
            </motion.div>

            {/* Club name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                <span className="text-orange-500">Shining Star</span>
                <br />
                United
              </h1>
            </motion.div>

            {/* Memorial text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5"
            >
              <p className="text-white font-semibold text-sm sm:text-base leading-relaxed">
                1st Lt. Solomon Timung &amp; Lt. Mongolsing Hanse,
              </p>
              <p className="text-orange-400 font-bold text-sm sm:text-base">
                Memorial Football Tournament
              </p>
            </motion.div>

            {/* Animated ball */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="text-3xl"
              >
                ⚽
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="text-3xl"
              >
                ⚽
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="text-3xl"
              >
                ⚽
              </motion.div>
            </motion.div>

            {/* Loading bar */}
            <motion.div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-orange-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
              />
            </motion.div>

          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
