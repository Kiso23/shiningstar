import { Clock, Pause } from 'lucide-react'

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
        <span className="text-sm font-medium text-gray-400">Final</span>
      </div>
    )
  }

  const extraTimeDisplay = isExtraTime ? Math.max(0, currentMinute - 45) : 0
  const displayTime = isExtraTime ? `45+${String(extraTimeDisplay).padStart(2, '0')}` : String(currentMinute).padStart(2, '0')

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Match Time Display - Shows exactly what admin set */}
      <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500/40 to-emerald-500/40 border-2 border-green-500/80 shadow-lg">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <div className="text-center">
          {isExtraTime ? (
            <div className="flex items-center gap-1">
              <span className="text-5xl font-black text-green-300 font-mono">45</span>
              <span className="text-2xl font-bold text-yellow-400">+</span>
              <span className="text-5xl font-black text-yellow-300 font-mono">{String(extraTimeDisplay).padStart(2, '0')}</span>
            </div>
          ) : (
            <span className="text-6xl font-black text-green-300 font-mono tabular-nums">{String(currentMinute).padStart(2, '0')}</span>
          )}
          <div className="text-xs text-green-300 font-bold mt-1">MIN</div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-500/20 border border-green-500/40">
        {isPaused ? (
          <>
            <Pause className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Paused</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Live</span>
          </>
        )}
      </div>
    </div>
  )
}
