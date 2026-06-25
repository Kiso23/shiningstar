import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Loader2, Check, AlertCircle } from 'lucide-react'
import type { MatchResponse } from '../../api/matches'
import type { MatchEventListResponse } from '../../api/matchEvents'
import { createMatchEvent, deleteMatchEvent, getMatchEvents } from '../../api/matchEvents'
import MatchEventsTimeline from '../shared/MatchEventsTimeline'

interface MatchEventFormProps {
  match: MatchResponse
  onUpdated?: () => void
}

export default function MatchEventForm({ match, onUpdated }: MatchEventFormProps) {
  const [showForm, setShowForm] = useState(false)
  const [events, setEvents] = useState<MatchEventListResponse | null>(null)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [eventType, setEventType] = useState<'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'own_goal'>('goal')
  const [team, setTeam] = useState<'team_a' | 'team_b'>('team_a')
  const [playerName, setPlayerName] = useState('')
  const [timeMinute, setTimeMinute] = useState('')
  const [playerReplaced, setPlayerReplaced] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadEvents = async () => {
    setLoadingEvents(true)
    try {
      const data = await getMatchEvents(match.id)
      setEvents(data)
    } catch {
      setError('Failed to load events')
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleOpenForm = () => {
    setShowForm(true)
    if (!events) {
      loadEvents()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName || !timeMinute) {
      setError('Player name and time are required')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      await createMatchEvent(match.id, {
        event_type: eventType,
        team,
        player_name: playerName,
        time_minute: parseInt(timeMinute),
        player_replaced: playerReplaced || undefined,
        notes: notes || undefined,
      })

      setSuccess('Event added successfully!')
      setPlayerName('')
      setTimeMinute('')
      setPlayerReplaced('')
      setNotes('')
      
      // Reload events
      await loadEvents()
      onUpdated?.()

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(null), 2000)
    } catch {
      setError('Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    setSubmitting(true)
    try {
      await deleteMatchEvent(match.id, eventId)
      await loadEvents()
      onUpdated?.()
      setDeleteId(null)
    } catch {
      setError('Failed to delete event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleOpenForm}
        type="button"
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors text-sm font-semibold"
      >
        <Plus className="w-4 h-4" />
        Add Event
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
                <h3 className="text-white font-bold">
                  Match Events: {match.team_a_name} vs {match.team_b_name}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Events */}
                {loadingEvents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                  </div>
                ) : events && events.events.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Recorded Events</h4>
                    <MatchEventsTimeline
                      events={events.events}
                      teamAName={match.team_a_name}
                      teamBName={match.team_b_name}
                    />
                  </div>
                ) : null}

                {/* Add Event Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h4 className="text-sm font-semibold text-white">Add New Event</h4>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      {success}
                    </motion.div>
                  )}

                  {/* Event Type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="goal">⚽ Goal</option>
                      <option value="own_goal">⚡ Own Goal</option>
                      <option value="yellow_card">🟨 Yellow Card</option>
                      <option value="red_card">🔴 Red Card</option>
                      <option value="substitution">🔄 Substitution</option>
                    </select>
                  </div>

                  {/* Team */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">Team</label>
                    <select
                      value={team}
                      onChange={(e) => setTeam(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="team_a">{match.team_a_name}</option>
                      <option value="team_b">{match.team_b_name}</option>
                    </select>
                  </div>

                  {/* Player Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">Player Name *</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="e.g., John Doe"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500/50"
                    />
                  </div>

                  {/* Time Minute */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">Time (minutes) *</label>
                    <input
                      type="number"
                      value={timeMinute}
                      onChange={(e) => setTimeMinute(e.target.value)}
                      placeholder="e.g., 45"
                      required
                      min="0"
                      max="200"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500/50"
                    />
                  </div>

                  {/* Player Replaced (for substitutions) */}
                  {eventType === 'substitution' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2">Player Replaced</label>
                      <input
                        type="text"
                        value={playerReplaced}
                        onChange={(e) => setPlayerReplaced(e.target.value)}
                        placeholder="Name of player being replaced"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional details..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500/50 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Event
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
