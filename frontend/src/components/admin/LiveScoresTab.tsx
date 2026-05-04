import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, Radio, Calendar, CheckCircle } from 'lucide-react'
import { getMatches, type MatchResponse } from '../../api/matches'
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

  const grouped: Record<StatusGroup, MatchResponse[]> = {
    live: matches.filter((m) => m.status === 'live'),
    scheduled: matches.filter((m) => m.status === 'scheduled'),
    completed: matches.filter((m) => m.status === 'completed'),
  }

  const statusGroups: StatusGroup[] = ['live', 'scheduled', 'completed']

  return (
    <div className="space-y-6">
      <h2 className="text-white font-bold text-lg">Live Scores</h2>

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
