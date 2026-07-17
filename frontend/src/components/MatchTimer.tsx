import { useEffect, useState } from 'react'
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
  const [displayMinutes, setDisplayMinutes] = useState(currentMinute)
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const [isCountingUp, setIsCountingUp] = useState(false)
  const [lastBackendMinute, setLastBackendMinute] = useState(currentMinute)
  const [isSynced, setIsSynced] = useState(true)

  // Detect when backend time changes (admin saved new time)
  useEffect(() => {
    if (currentMinute !== undefined && currentMinute !== lastBackendMinute) {
      // Backend has a new time - sync once
      setDisplayMinutes(currentMinute)
      setDisplaySeconds(0)
      setLastBackendMinute(currentMinute)
      setIsSynced(true)
    }
  }, [currentMinute, lastBackendMinute])

  // Auto-count seconds on live match (only if we're counting, don't reset on refresh)
  useEffect(() => {
    if (status !== 'live' || isPaused || !isSynced) {
      setIsCountingUp(false)
      return
    }

    setIsCountingUp(true)
    const interval = setInterval(() => {
      setDisplaySeconds((prev) => {
        if (prev < 59) return prev + 1
        // When seconds reach 60, increment minutes
        setDisplayMinutes((m) => {
          // Stop counting at half time (45 min) and full time (90 min)
          if (m === 44) return 45  // Reached half time
          if (m === 89) return 90  // Reached full time
          if (m >= 90) return m + 1  // Extra time keeps counting
          return m + 1
        })
        return 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status, isPaused, isSynced])

  const getPhaseInfo = (mins: number) => {
    if (mins < 45) return { label: '⚪ FIRST HALF', color: 'text-blue-400', bgColor: 'bg-blue-500/25', borderColor: 'border-blue-500/60' }
    if (mins === 45) return { label: '🟨 HALF TIME ⏸', color: 'text-yellow-400', bgColor: 'bg-yellow-500/30', borderColor: 'border-yellow-500/70' }
    if (mins > 45 && mins < 90) return { label: '⚪ SECOND HALF', color: 'text-blue-400', bgColor: 'bg-blue-500/25', borderColor: 'border-blue-500/60' }
    if (mins === 90) return { label: '🔴 FULL TIME ⏸', color: 'text-red-400', bgColor: 'bg-red-500/30', borderColor: 'border-red-500/70' }
    return { label: '🟡 EXTRA TIME', color: 'text-yellow-300', bgColor: 'bg-yellow-500/25', borderColor: 'border-yellow-500/60' }
  }

  const phase = getPhaseInfo(displayMinutes)

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

  // Live match - show counting stopwatch
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
      {/* Stopwatch Display */}
      <div className={`flex flex-col items-center justify-center ${phase.bgColor} px-4 sm:px-8 py-3 sm:py-5 rounded-lg border-2 ${phase.borderColor} shadow-lg min-w-fit`}>
        <div className="text-4xl sm:text-6xl font-black text-white font-mono tabular-nums leading-tight">
          {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
        </div>
        <div className={`text-xs sm:text-sm font-bold mt-1 sm:mt-2 ${phase.color} uppercase tracking-wider`}>
          {phase.label}
        </div>
        {isCountingUp && (
          <div className="text-xs text-green-400 mt-1 font-semibold">
            ▶ Live
          </div>
        )}
      </div>

      {/* Status Alert Badge - Mobile Optimized */}
      {(displayMinutes === 45 || displayMinutes === 90 || displayMinutes > 90) && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40 animate-pulse">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
          <span className="text-xs sm:text-xs font-bold text-yellow-400 uppercase">
            {displayMinutes === 45 && 'HALF TIME!'}
            {displayMinutes === 90 && 'FULL TIME!'}
            {displayMinutes > 90 && 'EXTRA TIME'}
          </span>
        </div>
      )}
    </div>
  )
}
