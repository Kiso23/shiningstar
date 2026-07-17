import { useEffect, useState } from 'react'
import { Clock, Play, Pause } from 'lucide-react'

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    setIsRunning(status === 'live' && !isPaused)
  }, [status, isPaused])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      if (matchStartTime) {
        const startTime = new Date(matchStartTime).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        setElapsedSeconds(Math.max(0, elapsed))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, matchStartTime])

  // Calculate display minute (use server's current_minute for sync)
  const displayMinute = currentMinute || Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const extraTimeMinute = isExtraTime ? displayMinute - 45 : 0
  
  // Format display
  const mainTime = `${String(displayMinute).padStart(2, '0')}`
  const extraDisplay = isExtraTime ? `+${String(extraTimeMinute).padStart(2, '0')}` : ''

  if (!matchStartTime && status !== 'scheduled') return null

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
      {/* Timer display */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border-2 border-green-500/50 animate-pulse">
        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-green-400 font-mono tabular-nums">{mainTime}</span>
          {isExtraTime && (
            <span className="text-lg font-bold text-green-300">{extraDisplay}</span>
          )}
          <span className="text-xs text-green-400 font-bold ml-1">MIN</span>
        </div>
        {isPaused && <Pause className="w-4 h-4 text-orange-400 ml-2" />}
        {!isPaused && isRunning && <Play className="w-4 h-4 text-green-400 ml-2" />}
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-bold text-green-400 uppercase tracking-wide">
          {isPaused ? 'PAUSED' : 'LIVE'}
        </span>
      </div>
    </div>
  )
}
