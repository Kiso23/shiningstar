import { useEffect, useState, useRef } from 'react'
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
  // displaySeconds counts from 0 upward continuously
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const [isCountingUp, setIsCountingUp] = useState(false)
  const [matchDuration, setMatchDuration] = useState(45)
  const [timerStarted, setTimerStarted] = useState(false)
  const timerStartedRef = useRef(false)

  // ONLY sync when match first becomes live (not on every update from backend)
  useEffect(() => {
    if (status === 'live' && !timerStartedRef.current && currentMinute !== undefined && currentMinute > 0) {
      // Match just became live - set duration and start from 0
      // After this, IGNORE all future backend updates
      setMatchDuration(currentMinute)
      setDisplaySeconds(0)
      setTimerStarted(true)
      timerStartedRef.current = true
    }
  }, [status, currentMinute])

  // Simple counter: just increment every second (NEVER resets after started)
  useEffect(() => {
    if (status !== 'live' || isPaused || !timerStarted) {
      setIsCountingUp(false)
      return
    }

    setIsCountingUp(true)
    const interval = setInterval(() => {
      setDisplaySeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [status, isPaused, timerStarted])

  // Convert seconds to minutes and seconds
  const displayMinutes = Math.floor(displaySeconds / 60)
  const displaySecs = displaySeconds % 60

  const getPhaseInfo = (mins: number) => {
    const totalTime = matchDuration
    const halfTime = totalTime / 2

    if (mins < halfTime) {
      return { 
        label: `⚪ FIRST HALF (0-${halfTime.toFixed(0)}')`, 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-500/25', 
        borderColor: 'border-blue-500/60',
        isAtPhase: false 
      }
    }
    if (mins === halfTime) {
      return { 
        label: `🟨 HALF TIME ⏸`, 
        color: 'text-yellow-400', 
        bgColor: 'bg-yellow-500/30', 
        borderColor: 'border-yellow-500/70',
        isAtPhase: true 
      }
    }
    if (mins > halfTime && mins < totalTime) {
      return { 
        label: `⚪ SECOND HALF (${halfTime.toFixed(0)}-${totalTime}')`, 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-500/25', 
        borderColor: 'border-blue-500/60',
        isAtPhase: false 
      }
    }
    if (mins === totalTime) {
      return { 
        label: `🔴 FULL TIME ⏸`, 
        color: 'text-red-400', 
        bgColor: 'bg-red-500/30', 
        borderColor: 'border-red-500/70',
        isAtPhase: true 
      }
    }
    return { 
      label: `🟡 EXTRA TIME`, 
      color: 'text-yellow-300', 
      bgColor: 'bg-yellow-500/25', 
      borderColor: 'border-yellow-500/60',
      isAtPhase: mins > totalTime 
    }
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
          {String(displayMinutes).padStart(2, '0')}:{String(displaySecs).padStart(2, '0')}
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
      {phase.isAtPhase && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40 animate-pulse">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
          <span className="text-xs sm:text-xs font-bold text-yellow-400 uppercase">
            {displayMinutes === matchDuration / 2 && 'HALF TIME!'}
            {displayMinutes === matchDuration && 'FULL TIME!'}
            {displayMinutes > matchDuration && 'EXTRA TIME'}
          </span>
        </div>
      )}
    </div>
  )
}
