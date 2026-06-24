import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useState, ComponentType } from 'react'

interface Notice {
  id: string
  title: string
  message: string
  type: 'warning' | 'info' | 'success' | 'alert'
  dismissible?: boolean
}

interface NoticeBoardProps {
  notices: Notice[]
  onDismiss?: (id: string) => void
}

interface TypeConfig {
  bgColor: string
  borderColor: string
  textColor: string
  icon: ComponentType<{ className?: string }>
}

type TypeConfigMap = {
  warning: TypeConfig
  info: TypeConfig
  success: TypeConfig
  alert: TypeConfig
}

const typeConfig: TypeConfigMap = {
  warning: {
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: '#f97316',
    textColor: '#f97316',
    icon: AlertCircle,
  },
  info: {
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: '#3b82f6',
    textColor: '#3b82f6',
    icon: Info,
  },
  success: {
    bgColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: '#22c55e',
    textColor: '#22c55e',
    icon: CheckCircle,
  },
  alert: {
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#ef4444',
    textColor: '#ef4444',
    icon: AlertCircle,
  },
}

export default function NoticeBoard({ notices, onDismiss }: NoticeBoardProps) {
  const [dismissedNotices, setDismissedNotices] = useState<Set<string>>(new Set())

  const handleDismiss = (id: string) => {
    setDismissedNotices((prev) => new Set(prev).add(id))
    onDismiss?.(id)
  }

  const visibleNotices = notices.filter((n) => !dismissedNotices.has(n.id))

  if (visibleNotices.length === 0) return null

  return (
    <div className="w-full space-y-3">
      {visibleNotices.map((notice, index) => {
        const config = typeConfig[notice.type]
        const IconComponent = config.icon

        return (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            style={{
              backgroundColor: config.bgColor,
              borderColor: config.borderColor,
            }}
            className="border-l-4 rounded-lg p-4 flex items-start gap-3 backdrop-blur-sm"
          >
            <div style={{ color: config.textColor }}>
              <IconComponent className="w-5 h-5 mt-0.5 shrink-0" />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="font-bold text-sm"
                style={{ color: config.textColor }}
              >
                {notice.title}
              </p>
              <p className="text-gray-200 text-xs mt-1 leading-relaxed">
                {notice.message}
              </p>
            </div>

            {notice.dismissible && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDismiss(notice.id)}
                className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-200" />
              </motion.button>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
