import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { updateScore, type MatchResponse, type ScoreUpdate } from '../../api/matches'
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

export default function ScoreUpdateForm({ match, onUpdated }: Props) {
  const isCompleted = match.status === 'completed'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

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
          disabled={submitting}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2
            ${saved
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : 'btn-primary'
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
