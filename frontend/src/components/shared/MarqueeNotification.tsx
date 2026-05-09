import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface MarqueeNotificationProps {
  message: string
  backgroundColor?: string
  textColor?: string
  iconColor?: string
}

const MarqueeNotification = ({
  message,
  backgroundColor = 'rgba(249, 115, 22, 0.15)',
  textColor = '#f97316',
  iconColor = '#f97316',
}: MarqueeNotificationProps) => {
  return (
    <div
      style={{ backgroundColor }}
      className="w-full py-3 px-4 overflow-hidden border-b border-orange-500/20"
    >
      <motion.div
        className="flex items-center gap-4 whitespace-nowrap"
        animate={{ x: ['100%', '-100%'] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="flex items-center gap-3 shrink-0">
          <AlertCircle style={{ color: iconColor }} className="w-5 h-5" />
          <span style={{ color: textColor }} className="font-semibold text-sm">
            {message}
          </span>
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex items-center gap-3 shrink-0">
          <AlertCircle style={{ color: iconColor }} className="w-5 h-5" />
          <span style={{ color: textColor }} className="font-semibold text-sm">
            {message}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default MarqueeNotification
