import { Clock, AlertCircle } from 'lucide-react'

interface MatchTimerProps {
  matchStartTime: string | null | undefined
  status: 'scheduled' | 'live' | 'completed'
  matchEndTime?: string | null
  currentMinute?: number
  isExtraTime?: boolean
  isPaused?: boolean
}

export default function MatchTimer({ 
  matchStartTime, 
  status, 
  matchEndTime,
  currentMinute = 0,
  isExtraTime = false,
  isPaused = false
}: MatchTimerProps) {
  const getStatusInfo = (minutes: number) => {
    if (minutes < 45) {
      return { label: '⚪ FIRST HALF', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/50' }
    }
    if (minutes === 45) {
      return { label: '🟨 HALF TIME', color: 'text-yellow-400', bgColor: 'bg-yellow-500/30', borderColor: 'border-yellow-500/70' }
    }
    if (minutes > 45 && minutes < 90) {
      return { label: '⚪ SECOND HALF', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/50' }
    }
    if (minutes === 90) {
      return { label: '🔴 FULL TIME', color: 'text-red-400', bgColor: 'bg-red-500/30', borderColor: 'border-red-500/70' }
    }
    if (minutes > 90) {
      return { label: '🟡 EXTRA TIME', color: 'text-yellow-300', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50' }
    }
    return { label: '⚪ MATCH', color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/50' }
  }

  const statusInfo = getStatusInfo(currentMinute)

  if (status === 'scheduled') {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30">
        <Clock className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-blue-400">Scheduled</span>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-500/20 border border-gray-500/30">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-400">Match Finished</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Large Time Display with Status */}
      <div className={`flex flex-col items-center justify-center ${statusInfo.bgColor} px-6 py-4 rounded-lg border-2 ${statusInfo.borderColor} shadow-lg`}>
        <div className="text-5xl font-black text-white font-mono tabular-nums">
          {String(currentMinute).padStart(2, '0')}
        </div>
        <div className={`text-xs font-bold mt-2 ${statusInfo.color} uppercase tracking-wider`}>
          {statusInfo.label}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/20 border border-green-500/40">
        {currentMinute === 45 ? (
          <>
            <AlertCircle className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-xs font-bold text-yellow-400 uppercase">HALF TIME</span>
          </>
        ) : currentMinute === 90 ? (
          <>
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase">FULL TIME</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-green-400 uppercase">Live</span>
          </>
        )}
      </div>
    </div>
  )
}
