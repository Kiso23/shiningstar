import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, CheckCircle, Plus, X, Goal, AlertTriangle, Zap, Clock, Play } from 'lucide-react'
import { updateScore, updateTimer, type MatchResponse, type ScoreUpdate, type TimerUpdate } from '../../api/matches'
import { getMatchEvents, createMatchEvent, deleteMatchEvent, type MatchEventResponse } from '../../api/matchEvents'
import { extractErrorMessage } from '../../api/errors'

interface Props {
  match: MatchResponse
  onUpdated: () => void
}

const STATUS_OPTIONS: { value: ScoreUpdate['status']; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
]

const EVENT_TYPES = [
  { value: 'goal', label: '⚽ Goal', color: 'text-green-400' },
  { value: 'yellow_card', label: '🟨 Yellow Card', color: 'text-yellow-400' },
  { value: 'red_card', label: '🔴 Red Card', color: 'text-red-400' },
]

export default function ScoreUpdateForm({ match, onUpdated }: Props) {
  const isCompleted = match.status === 'completed'
  const isLive = match.status === 'live'
  const canAddEvents = isLive || isCompleted  // Allow adding events to live OR completed matches

  // Score form
  const [scoreA, setScoreA] = useState<string>(
    match.team_a_score !== null ? String(match.team_a_score) : ''
  )
  const [scoreB, setScoreB] = useState<string>(
    match.team_b_score !== null ? String(match.team_b_score) : ''
  )
  const [status, setStatus] = useState<ScoreUpdate['status']>(match.status)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Validation flags
  const canMarkCompleted = scoreA !== '' && scoreB !== ''
  const isFormDisabled = isCompleted || (status === 'completed' && !canMarkCompleted)

  // Events
  const [events, setEvents] = useState<MatchEventResponse[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [eventType, setEventType] = useState<'goal' | 'yellow_card' | 'red_card'>('goal')
  const [eventTeam, setEventTeam] = useState<'team_a' | 'team_b'>('team_a')
  const [playerName, setPlayerName] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [addingEvent, setAddingEvent] = useState(false)
  const [eventError, setEventError] = useState<string | null>(null)

  // Real stopwatch timer
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [submittingTimer, setSubmittingTimer] = useState(false)

  // Calculate minutes and seconds
  const minutes = Math.floor(timerSeconds / 60)
  const seconds = timerSeconds % 60

  // Get match status based on minutes
  const getMatchPhase = (mins: number) => {
    if (mins < 45) return { label: '⚪ FIRST HALF', color: 'text-blue-400' }
    if (mins === 45) return { label: '🟨 HALF TIME', color: 'text-yellow-400' }
    if (mins > 45 && mins < 90) return { label: '⚪ SECOND HALF', color: 'text-blue-400' }
    if (mins === 90) return { label: '🔴 FULL TIME', color: 'text-red-400' }
    return { label: '🟡 EXTRA TIME', color: 'text-yellow-300' }
  }

  const phase = getMatchPhase(minutes)

  // Initialize from match data
  useEffect(() => {
    setTimerSeconds((match.current_minute || 0) * 60)
  }, [match.id])

  // Stopwatch - counts up every second
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  // Load events when component mounts or match changes
  useEffect(() => {
    if (canAddEvents) {
      fetchEvents()
    }
  }, [match.id, canAddEvents])

  const fetchEvents = async () => {
    setLoadingEvents(true)
    try {
      const data = await getMatchEvents(match.id)
      setEvents(data.events || [])
    } catch {
      setEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate: if marking as completed, both scores must be set
    if (status === 'completed') {
      if (scoreA === '' || scoreB === '') {
        setError('Both scores must be set before marking match as completed')
        return
      }
    }
    
    setSubmitting(true)
    setError(null)
    setSaved(false)
    try {
      await updateScore(match.id, {
        team_a_score: scoreA !== '' ? Number(scoreA) : undefined,
        team_b_score: scoreB !== '' ? Number(scoreB) : undefined,
        status,
      })
      setSaved(true)
      onUpdated()
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to update score.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName || !eventTime) {
      setEventError('Player name and time required')
      return
    }

    setAddingEvent(true)
    setEventError(null)
    try {
      await createMatchEvent(match.id, {
        event_type: eventType,
        team: eventTeam,
        player_name: playerName,
        time_minute: parseInt(eventTime),
      })
      setPlayerName('')
      setEventTime('')
      setEventType('goal')
      await fetchEvents()
      onUpdated()
    } catch {
      setEventError('Failed to add event')
    } finally {
      setAddingEvent(false)
    }
  }

  const handleTimerSubmit = async () => {
    setSubmittingTimer(true)
    try {
      await updateTimer(match.id, {
        current_minute: minutes,
        is_extra_time: minutes >= 90,
        is_paused: !isRunning,
      })
      onUpdated()
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to update timer.'))
    } finally {
      setSubmittingTimer(false)
    }
  }

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setTimerSeconds(0)
    setIsRunning(false)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteMatchEvent(match.id, eventId)
      await fetchEvents()
      onUpdated()
    } catch {
      setEventError('Failed to delete event')
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <Goal className="w-3 h-3" />
      case 'yellow_card':
        return <AlertTriangle className="w-3 h-3" />
      case 'red_card':
        return <Zap className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Score inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1 truncate">{match.team_a_name}</p>
          <input
            type="number"
            min={0}
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            disabled={isCompleted}
            placeholder="0"
            className="input-field text-center text-xl font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="text-gray-600 font-bold text-lg pt-5">-</div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1 truncate">{match.team_b_name}</p>
          <input
            type="number"
            min={0}
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            disabled={isCompleted}
            placeholder="0"
            className="input-field text-center text-xl font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Status selector */}
      <div>
        <label className="label">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ScoreUpdate['status'])}
          disabled={isCompleted}
          className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {STATUS_OPTIONS.map((opt) => {
            const isDisabled = opt.value === 'completed' && !canMarkCompleted
            return (
              <option 
                key={opt.value} 
                value={opt.value}
                disabled={isDisabled}
              >
                {opt.label}
                {isDisabled ? ' (set both scores first)' : ''}
              </option>
            )
          })}
        </select>
        {!canMarkCompleted && status === 'completed' && (
          <p className="text-xs text-orange-400 mt-1">⚠️ Both scores must be set before completing</p>
        )}
      </div>

      {/* STOPWATCH TIMER - APPEARS WHEN LIVE */}
      {status === 'live' && (
        <div className="bg-green-500/20 border-2 border-green-500 p-4 rounded-lg space-y-2">
          <div className="text-center">
            <p className="text-green-400 font-bold text-sm">⏱️ LIVE STOPWATCH</p>
            <div className="text-5xl font-black text-green-300 font-mono mt-2">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className={`text-sm font-bold mt-1 ${phase.color}`}>{phase.label}</p>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleStartStop}
              className={`flex-1 py-2 font-bold rounded ${isRunning ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'}`}
            >
              {isRunning ? '⏸ STOP' : '▶ START'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 font-bold bg-red-600 text-white rounded"
            >
              🔄 RESET
            </button>
          </div>

          <button
            type="button"
            onClick={handleTimerSubmit}
            disabled={submittingTimer}
            className="w-full py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
          >
            {submittingTimer ? '💾 SAVING...' : '💾 SAVE TIME'}
          </button>

          <details className="text-xs">
            <summary className="cursor-pointer font-bold text-green-400 p-1 hover:bg-green-500/10 rounded">
              ⚙️ SET TIME
            </summary>
            <div className="space-y-1 mt-1 p-2 bg-black/20 rounded">
              <input
                type="number"
                min="0"
                max="150"
                value={minutes}
                onChange={(e) => setTimerSeconds(Number(e.target.value) * 60 + seconds)}
                placeholder="Min"
                className="w-full bg-gray-800 text-white border border-green-500 rounded px-2 py-1"
              />
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setTimerSeconds(minutes * 60 + Number(e.target.value))}
                placeholder="Sec"
                className="w-full bg-gray-800 text-white border border-green-500 rounded px-2 py-1"
              />
            </div>
          </details>
        </div>
      )}

      {/* Real Match Stopwatch - ONLY SHOW FOR LIVE MATCHES */}
      {status === 'live' && (
        <div className="space-y-3 pt-3 border-t-2 border-green-500/50 bg-green-500/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-green-400" />
            <label className="label text-sm font-bold text-green-300">⏱️ LIVE STOPWATCH</label>
          </div>

          {/* Large Timer Display */}
          <div className="bg-green-900/40 border-2 border-green-500 p-6 rounded-lg text-center">
            <div className="text-7xl font-black text-green-300 font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-green-400 font-bold mt-2 text-lg">
              {phase.label}
            </div>
          </div>

          {/* Control Buttons - START / STOP / RESET */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStartStop}
              className={`flex-1 py-3 font-bold text-white rounded-lg transition-all ${
                isRunning
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? '⏸ STOP' : '▶ START'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
            >
              🔄 RESET
            </button>
          </div>

          {/* SET TIME MANUALLY */}
          <details className="border border-green-500/30 rounded-lg">
            <summary className="cursor-pointer font-bold text-green-400 p-3 hover:bg-green-500/10">
              ⚙️ SET TIME MANUALLY
            </summary>
            <div className="space-y-2 p-3 bg-green-500/5 border-t border-green-500/30">
              <div className="flex gap-2">
                <label className="text-white font-bold w-16">Minutes:</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={minutes}
                  onChange={(e) => setTimerSeconds(Number(e.target.value) * 60 + seconds)}
                  className="flex-1 bg-gray-800 text-white border border-green-500 rounded px-3 py-2 font-bold text-lg"
                />
              </div>
              <div className="flex gap-2">
                <label className="text-white font-bold w-16">Seconds:</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setTimerSeconds(minutes * 60 + Number(e.target.value))}
                  className="flex-1 bg-gray-800 text-white border border-green-500 rounded px-3 py-2 font-bold text-lg"
                />
              </div>
            </div>
          </details>

          {/* SYNC BUTTON - MAIN ACTION */}
          <button
            type="button"
            onClick={handleTimerSubmit}
            disabled={submittingTimer}
            className="w-full py-3 font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {submittingTimer ? '⏳ SYNCING...' : '💾 SAVE TIME TO WEBSITE'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            {isRunning ? '▶ Timer is RUNNING' : '⏸ Timer is STOPPED'}
          </p>
        </div>
      )}

      {/* Events section - show for live OR completed matches for editing */}
      {canAddEvents && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400">Match Events</p>
            <button
              type="button"
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="p-1 rounded hover:bg-white/5 text-orange-400 hover:text-orange-300"
            >
              {showAddEvent ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {/* Add Event Form */}
          <AnimatePresence>
            {showAddEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex gap-2">
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as 'goal' | 'yellow_card' | 'red_card')}
                    className="flex-1 input-field text-xs py-1"
                  >
                    <option value="goal">⚽ Goal</option>
                    <option value="yellow_card">🟨 Yellow Card</option>
                    <option value="red_card">🔴 Red Card</option>
                  </select>
                  <select
                    value={eventTeam}
                    onChange={(e) => setEventTeam(e.target.value as 'team_a' | 'team_b')}
                    className="flex-1 input-field text-xs py-1"
                  >
                    <option value="team_a">{match.team_a_name}</option>
                    <option value="team_b">{match.team_b_name}</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Player name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="input-field text-xs py-1 w-full"
                />

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Time (min)"
                    min="0"
                    max="200"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="input-field text-xs py-1 flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddEvent}
                    disabled={addingEvent}
                    className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {addingEvent ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
                  </button>
                </div>

                {eventError && (
                  <p className="text-xs text-red-400">{eventError}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Events List */}
          {loadingEvents ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {events
                .sort((a, b) => a.time_minute - b.time_minute)
                .map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-orange-400">{getEventIcon(event.event_type)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{event.player_name}</p>
                        <p className="text-gray-500 text-xs">
                          {event.team === 'team_a' ? match.team_a_name : match.team_b_name} · {event.time_minute}'
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600 py-2">No events yet</p>
          )}
        </div>
      )}

      {/* Completed notice */}
      {isCompleted && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-500/10 border border-gray-500/20 text-gray-400 text-xs">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          Match completed — scores are locked
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Save button */}
      {!isCompleted && (
        <button
          type="submit"
          disabled={submitting || (status === 'completed' && !canMarkCompleted)}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2
            ${saved
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : 'btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved</>
          ) : (
            'Update Score'
          )}
        </button>
      )}
    </form>
  )
}
