import { useEffect, useState } from 'react'
import { Clock, Pause, Zap } from 'lucide-react'

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
  const [displayMinute, setDisplayMinute] = useState(currentMinute)
  const [displaySeconds, setDisplaySeconds] = useState(0)

  useEffect(() => {
    setDisplayMinute(currentMinute)
  }, [currentMinute])

  useEffect(() => {
    if (status !== 'live' || isPaused) return

    const interval = setInterval(() => {
      setDisplaySeconds((prev) => {
        if (prev < 59) {
          return prev + 1
        }
        setDisplayMinute((m) => m + 1)
        return 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status, isPaused])

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

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Stopwatch Display */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-500/70 animate-pulse shadow-lg">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <div className="flex items-baseline gap-0.5">
          <span className="text-5xl font-black text-green-300 font-mono tabular-nums">{String(displayMinute).padStart(2, '0')}</span>
          <span className="text-2xl font-bold text-green-300 font-mono">:</span>
          <span className="text-4xl font-black text-green-300 font-mono tabular-nums">{String(displaySeconds).padStart(2, '0')}</span>
          {isExtraTime && (
            <span className="text-2xl font-bold text-yellow-400 ml-2">
              +{String(Math.max(0, displayMinute - 45)).padStart(2, '0')}
            </span>
          )}
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
