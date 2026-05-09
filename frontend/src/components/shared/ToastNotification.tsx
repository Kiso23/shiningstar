import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

const ToastNotification = ({ message, type = 'info', onClose, duration = 8000 }: ToastProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const styles = {
    info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', icon: Info, color: '#60a5fa' },
    success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: CheckCircle, color: '#4ade80' },
    warning: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)', icon: AlertCircle, color: '#f97316' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: AlertCircle, color: '#f87171' },
  }

  const currentStyle = styles[type]
  const Icon = currentStyle.icon

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: visible ? 0 : 100, opacity: visible ? 1 : 0 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed top-24 right-4 z-[100] w-full sm:w-96"
    >
      <div
        style={{ backgroundColor: currentStyle.bg, borderColor: currentStyle.border }}
        className="flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl"
      >
        <Icon style={{ color: currentStyle.color }} className="w-5 h-5 mt-0.5 shrink-0 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed" style={{ color: '#f0f4f0' }}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 flex-shrink-0"
        >
          <X className="w-4 h-4" style={{ color: '#9ca3af' }} />
        </button>
      </div>
    </motion.div>
  )
}

export default ToastNotification
