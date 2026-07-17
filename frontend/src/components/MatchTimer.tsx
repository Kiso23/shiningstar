import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface MatchTimerProps {
  matchStartTime: string | null | undefined
  status: 'scheduled' | 'live' | 'completed'
  matchEndTime?: string | null
}

export default function MatchTimer({ matchStartTime, status, matchEndTime }: MatchTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    setIsRunning(status === 'live')
  }, [status])

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

  // Calculate minutes and seconds
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  if (!matchStartTime && status !== 'scheduled') return null

  if (status === 'scheduled') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Scheduled</span>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500/30 text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Final</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 animate-pulse">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-lg font-bold text-green-400 font-mono">{formattedTime}</span>
      <span className="text-xs text-green-400 font-medium">LIVE</span>
    </div>
  )
}
