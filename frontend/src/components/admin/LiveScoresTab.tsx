import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, Radio, Calendar, CheckCircle, Trash2 } from 'lucide-react'
import { getMatches, type MatchResponse } from '../../api/matches'
import { clearStandings } from '../../api/standings'
import ScoreUpdateForm from './ScoreUpdateForm'

type StatusGroup = 'live' | 'scheduled' | 'completed'

const GROUP_CONFIG: Record<StatusGroup, { label: string; icon: React.ReactNode; color: string }> = {
  live: {
    label: 'Live',
    icon: <Radio className="w-4 h-4" />,
    color: 'text-green-400',
  },
  scheduled: {
    label: 'Scheduled',
    icon: <Calendar className="w-4 h-4" />,
    color: 'text-blue-400',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-gray-400',
  },
}

export default function LiveScoresTab() {
  const [matches, setMatches] = useState<MatchResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMatches()
      setMatches(data)
    } catch {
      setError('Failed to load matches.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const handleClearStandings = async () => {
    setClearing(true)
    try {
      await clearStandings()
      setShowClearConfirm(false)
    } catch {
      // ignore
    } finally {
      setClearing(false)
    }
  }

  const grouped: Record<StatusGroup, MatchResponse[]> = {
    live: matches.filter((m) => m.status === 'live'),
    scheduled: matches.filter((m) => m.status === 'scheduled'),
    completed: matches.filter((m) => m.status === 'completed'),
  }

  const statusGroups: StatusGroup[] = ['live', 'scheduled', 'completed']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Live Scores</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear Leaderboard
        </motion.button>
      </div>

      {/* Clear confirmation dialog */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="flex items-start gap-2 flex-1">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm">Clear all leaderboard standings?</p>
                <p className="text-red-400/70 text-xs mt-0.5">This will reset all team points, wins, losses and goals. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearStandings}
                disabled={clearing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Yes, Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Radio className="w-10 h-10 mb-3 opacity-30" />
          <p>No matches yet. Add fixtures first.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {statusGroups.map((statusKey) => {
            const group = grouped[statusKey]
            if (group.length === 0) return null
            const config = GROUP_CONFIG[statusKey]
            return (
              <div key={statusKey}>
                <div className={`flex items-center gap-2 mb-3 ${config.color}`}>
                  {config.icon}
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    {config.label} ({group.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.map((match, idx) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`glass-card p-4 space-y-3 ${
                        statusKey === 'live' ? 'border border-green-500/20' : ''
                      }`}
                    >
                      {/* Match header */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">{match.round}</p>
                        <p className="text-white font-semibold text-sm">
                          {match.team_a_name}
                          <span className="text-gray-600 mx-2">vs</span>
                          {match.team_b_name}
                        </p>
                        {match.status === 'completed' && match.team_a_score !== null && (
                          <p className="text-2xl font-black text-white mt-1">
                            {match.team_a_score} – {match.team_b_score}
                          </p>
                        )}
                      </div>
                      {/* Score update form */}
                      <ScoreUpdateForm match={match} onUpdated={fetchMatches} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
