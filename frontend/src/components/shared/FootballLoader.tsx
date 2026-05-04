import { motion } from 'framer-motion'

interface Props {
  text?: string
}

export default function FootballLoader({ text = 'Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Player + ball animation */}
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

          {/* ── Shadow ── */}
          <motion.ellipse
            cx="80" cy="148" rx="28" ry="6"
            fill="rgba(0,0,0,0.3)"
            animate={{ scaleX: [1, 0.7, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── Ball ── */}
          <motion.g
            animate={{ x: [0, 38, 0], y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="118" cy="130" r="14" fill="#f97316" />
            {/* pentagon patches */}
            <circle cx="118" cy="130" r="14" fill="none" stroke="#1f2937" strokeWidth="1.5"
              strokeDasharray="6 4" />
            <circle cx="118" cy="124" r="3" fill="#1f2937" />
            <circle cx="123" cy="133" r="3" fill="#1f2937" />
            <circle cx="113" cy="133" r="3" fill="#1f2937" />
          </motion.g>

          {/* ── Player body ── */}
          {/* torso */}
          <rect x="68" y="72" width="22" height="28" rx="6" fill="#f97316" />

          {/* head */}
          <circle cx="79" cy="58" r="14" fill="#fcd9b0" />
          {/* hair */}
          <path d="M65 54 Q79 42 93 54 Q90 44 79 42 Q68 44 65 54Z" fill="#1f2937" />
          {/* eyes */}
          <circle cx="74" cy="57" r="2" fill="#1f2937" />
          <circle cx="84" cy="57" r="2" fill="#1f2937" />
          {/* smile */}
          <path d="M74 63 Q79 67 84 63" stroke="#c2410c" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* left arm (static) */}
          <rect x="56" y="74" width="12" height="6" rx="3" fill="#fcd9b0" transform="rotate(-20 56 74)" />

          {/* right arm (swings) */}
          <motion.rect
            x="90" y="74" width="12" height="6" rx="3" fill="#fcd9b0"
            style={{ originX: '90px', originY: '74px' }}
            animate={{ rotate: [-20, 20, -20] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* shorts */}
          <rect x="68" y="96" width="22" height="14" rx="4" fill="#1f2937" />

          {/* left leg (static) */}
          <rect x="68" y="108" width="9" height="22" rx="4" fill="#fcd9b0" />
          {/* left boot */}
          <rect x="65" y="126" width="14" height="7" rx="3" fill="#1f2937" />

          {/* right leg (kicking) */}
          <motion.g
            style={{ originX: '83px', originY: '108px' }}
            animate={{ rotate: [-10, -55, -10] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="81" y="108" width="9" height="22" rx="4" fill="#fcd9b0" />
            {/* right boot */}
            <rect x="78" y="126" width="16" height="7" rx="3" fill="#1f2937" />
          </motion.g>

        </svg>
      </div>

      {/* Bouncing dots */}
      <div className="flex items-end gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-orange-500"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {text && (
        <p className="text-gray-400 text-sm font-medium tracking-wide">{text}</p>
      )}
    </div>
  )
}
