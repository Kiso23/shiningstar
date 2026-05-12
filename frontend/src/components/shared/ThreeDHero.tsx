import { motion } from 'framer-motion'

export default function ThreeDHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl border border-orange-500/20"
      style={{
        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(45deg, #f97316, #22c55e, #f97316)',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-2 h-2 rounded-full bg-orange-500"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}

      {/* Main image container */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotateZ: [0, 2, -2, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <motion.img
          src="/football-player.jpg"
          alt="Football Player"
          className="w-full h-full object-cover rounded-2xl"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl" />

      {/* Glow effect */}
      <motion.div
        animate={{
          boxShadow: [
            'inset 0 0 20px rgba(249, 115, 22, 0.2)',
            'inset 0 0 40px rgba(249, 115, 22, 0.4)',
            'inset 0 0 20px rgba(249, 115, 22, 0.2)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
      />
    </motion.div>
  )
}
