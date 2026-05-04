import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { createMatch, updateMatch, VALID_ROUNDS, type MatchResponse } from '../../api/matches'
import { extractErrorMessage } from '../../api/errors'

export interface TeamOption {
  id: string
  team_name: string
}

interface Props {
  onClose: () => void
  onSaved: () => void
  fixture?: MatchResponse
  teams: TeamOption[]
}

export default function FixtureForm({ onClose, onSaved, fixture, teams }: Props) {
  const isEdit = !!fixture

  const [teamAId, setTeamAId] = useState(fixture?.team_a_id ?? '')
  const [teamBId, setTeamBId] = useState(fixture?.team_b_id ?? '')
  const [scheduledAt, setScheduledAt] = useState(
    fixture?.scheduled_at
      ? new Date(fixture.scheduled_at).toISOString().slice(0, 16)
      : ''
  )
  const [venue, setVenue] = useState(fixture?.venue ?? '')
  const [round, setRound] = useState(fixture?.round ?? VALID_ROUNDS[0])
  const [group, setGroup] = useState(fixture?.group ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sameTeamError = teamAId && teamBId && teamAId === teamBId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sameTeamError) return

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        team_a_id: teamAId,
        team_b_id: teamBId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        venue,
        round,
        group: group || undefined,
      }
      if (isEdit) {
        await updateMatch(fixture.id, { scheduled_at: payload.scheduled_at, venue, round, group: group || undefined })
      } else {
        await createMatch(payload)
      }
      onSaved()
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to save fixture.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card w-full max-w-lg p-6"
        >
          {/* Modal header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">
              {isEdit ? 'Edit Fixture' : 'Add Fixture'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Team A */}
            <div>
              <label className="label">Team A</label>
              <select
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                required
                disabled={isEdit}
                className="input-field"
              >
                <option value="" disabled>Select Team A</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
            </div>

            {/* Team B */}
            <div>
              <label className="label">Team B</label>
              <select
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                required
                disabled={isEdit}
                className="input-field"
              >
                <option value="" disabled>Select Team B</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
              {sameTeamError && (
                <p className="error-text">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Team A and Team B must be different
                </p>
              )}
            </div>

            {/* Date/Time */}
            <div>
              <label className="label">Date &amp; Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="input-field"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="label">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                placeholder="e.g. Rongbong Ronghang Playground"
                className="input-field"
              />
            </div>

            {/* Round */}
            <div>
              <label className="label">Round</label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                required
                className="input-field"
              >
                {VALID_ROUNDS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Group (optional) */}
            <div>
              <label className="label">Group <span className="text-gray-600">(optional)</span></label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="e.g. Group A"
                className="input-field"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !!sameTeamError}
                className="btn-primary flex-1"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {isEdit ? 'Save Changes' : 'Create Fixture'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
