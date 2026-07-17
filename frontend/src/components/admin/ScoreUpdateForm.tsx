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

  // Match timer control - manual time setting
  const [displayMinutes, setDisplayMinutes] = useState(0)
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const [isExtraTime, setIsExtraTime] = useState(false)
  const [extraTimeMinutes, setExtraTimeMinutes] = useState(0)
  const [submittingTimer, setSubmittingTimer] = useState(false)

  // Initialize from match data
  useEffect(() => {
    setDisplayMinutes(match.current_minute || 0)
    setIsExtraTime(match.is_extra_time || false)
    setExtraTimeMinutes(Math.max(0, (match.current_minute || 0) - 45))
  }, [match])

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
        current_minute: isExtraTime ? 45 + extraTimeMinutes : displayMinutes,
        is_extra_time: isExtraTime,
        is_paused: false, // Always unpause when updating
      })
      onUpdated()
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to update timer.'))
    } finally {
      setSubmittingTimer(false)
    }
  }

  const handleExtraTimeToggle = (enable: boolean) => {
    setIsExtraTime(enable)
    if (enable && displayMinutes < 45) {
      setDisplayMinutes(45)
    }
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

      {/* Match Timer Control - Manual Time Setting like Professional Football */}
      {(
        <div className="space-y-3 pt-3 border-t-2 border-purple-500/30 bg-purple-500/5 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <label className="label text-sm font-bold text-purple-400">Set Match Time</label>
          </div>

          {/* Time Display Preview */}
          <div className="flex items-center justify-center bg-gradient-to-b from-purple-900/40 to-purple-900/20 p-4 rounded-lg border-2 border-purple-500/50">
            <div className="text-center">
              <div className="text-6xl font-black text-purple-300 font-mono tabular-nums">
                {String(isExtraTime ? extraTimeMinutes : displayMinutes).padStart(2, '0')}
              </div>
              <div className="text-sm text-purple-400 font-semibold mt-2">
                {isExtraTime ? '45+ Minutes (Extra Time)' : 'Minutes'}
              </div>
            </div>
          </div>

          {/* Time Input - First Half (0-45 minutes) */}
          {!isExtraTime && (
            <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-purple-500/20">
              <label className="text-xs text-purple-300 font-semibold">First Half (0-45 min)</label>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setDisplayMinutes(Math.max(0, displayMinutes - 1))}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max="45"
                  value={displayMinutes}
                  onChange={(e) => setDisplayMinutes(Math.max(0, Math.min(45, Number(e.target.value))))}
                  className="flex-1 input-field text-center text-4xl font-black py-2"
                />
                <button
                  type="button"
                  onClick={() => setDisplayMinutes(Math.min(45, displayMinutes + 1))}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Extra Time Input - After 45 minutes */}
          {isExtraTime && (
            <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-yellow-500/20">
              <label className="text-xs text-yellow-300 font-semibold">Extra Time (45+X min)</label>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setExtraTimeMinutes(Math.max(0, extraTimeMinutes - 1))}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-lg"
                >
                  −
                </button>
                <div className="flex-1 flex items-center justify-center gap-2 text-3xl font-black text-yellow-300">
                  <span>45</span>
                  <span className="text-yellow-400">+</span>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={extraTimeMinutes}
                    onChange={(e) => setExtraTimeMinutes(Math.max(0, Math.min(60, Number(e.target.value))))}
                    className="input-field text-center text-3xl font-black py-2 w-20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setExtraTimeMinutes(Math.min(60, extraTimeMinutes + 1))}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Extra Time Toggle */}
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-yellow-500/20">
            <input
              type="checkbox"
              id="enableExtraTime"
              checked={isExtraTime}
              onChange={(e) => handleExtraTimeToggle(e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer accent-yellow-400"
            />
            <label htmlFor="enableExtraTime" className="flex-1 cursor-pointer">
              <p className="text-white font-semibold text-sm">
                {isExtraTime ? '🟨 Extra Time Active' : '⚪ First Half'}
              </p>
              <p className="text-gray-400 text-xs">
                {isExtraTime 
                  ? 'Showing 45+ minutes format' 
                  : 'Click to switch to extra time after 45 minutes'}
              </p>
            </label>
          </div>

          {/* Save to Server */}
          <button
            type="button"
            onClick={handleTimerSubmit}
            disabled={submittingTimer}
            className="w-full py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {submittingTimer ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Save Time {isExtraTime ? `(45+${extraTimeMinutes})` : `(${displayMinutes})`} to Website
          </button>
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
