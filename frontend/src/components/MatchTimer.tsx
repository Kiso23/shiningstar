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
  const [displayMinutes, setDisplayMinutes] = useState(0)
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const [isCountingUp, setIsCountingUp] = useState(false)
  const [lastSyncedMinute, setLastSyncedMinute] = useState(-1)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // When admin saves a new time, sync it once
  useEffect(() => {
    if (currentMinute !== undefined && currentMinute !== lastSyncedMinute) {
      // Admin set a new time - start counting from 0
      setDisplayMinutes(0)
      setDisplaySeconds(0)
      setElapsedSeconds(0)
      setLastSyncedMinute(currentMinute)
    }
  }, [currentMinute, lastSyncedMinute])

  // Auto-count seconds on live match - count continuously regardless of admin time
  useEffect(() => {
    if (status !== 'live' || isPaused || lastSyncedMinute === -1) {
      setIsCountingUp(false)
      return
    }

    setIsCountingUp(true)
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [status, isPaused, lastSyncedMinute])

  // Convert elapsed seconds to display minutes and seconds
  useEffect(() => {
    const mins = Math.floor(elapsedSeconds / 60)
    const secs = elapsedSeconds % 60
    setDisplayMinutes(mins)
    setDisplaySeconds(secs)
  }, [elapsedSeconds])

  const getPhaseInfo = (mins: number, adminSetMinutes: number) => {
    const halfTime = adminSetMinutes
    const fullTime = adminSetMinutes * 2

    if (mins < halfTime) {
      return { label: `⚪ FIRST HALF (0-${halfTime}')`, color: 'text-blue-400', bgColor: 'bg-blue-500/25', borderColor: 'border-blue-500/60' }
    }
    if (mins === halfTime) {
      return { label: `🟨 HALF TIME ⏸ (${halfTime}')`, color: 'text-yellow-400', bgColor: 'bg-yellow-500/30', borderColor: 'border-yellow-500/70' }
    }
    if (mins > halfTime && mins < fullTime) {
      return { label: `⚪ SECOND HALF (${halfTime}-${fullTime}')`, color: 'text-blue-400', bgColor: 'bg-blue-500/25', borderColor: 'border-blue-500/60' }
    }
    if (mins === fullTime) {
      return { label: `🔴 FULL TIME ⏸ (${fullTime}')`, color: 'text-red-400', bgColor: 'bg-red-500/30', borderColor: 'border-red-500/70' }
    }
    return { label: `🟡 EXTRA TIME (${fullTime}+')`, color: 'text-yellow-300', bgColor: 'bg-yellow-500/25', borderColor: 'border-yellow-500/60' }
  }

  const adminSetMinutes = lastSyncedMinute > 0 ? lastSyncedMinute : 45
  const phase = getPhaseInfo(displayMinutes, adminSetMinutes)
  const halfTime = adminSetMinutes
  const fullTime = adminSetMinutes * 2

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
      {(displayMinutes === halfTime || displayMinutes === fullTime || displayMinutes > fullTime) && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40 animate-pulse">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
          <span className="text-xs sm:text-xs font-bold text-yellow-400 uppercase">
            {displayMinutes === halfTime && 'HALF TIME!'}
            {displayMinutes === fullTime && 'FULL TIME!'}
            {displayMinutes > fullTime && 'EXTRA TIME'}
          </span>
        </div>
      )}
    </div>
  )
}
