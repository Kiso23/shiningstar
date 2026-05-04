import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { getStandings, type StandingResponse } from '../api/standings'

const RANK_STYLES: Record<number, { bg: string; text: string; badge: string }> = {
  1: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400', badge: '🥇' },
  2: { bg: 'bg-gray-400/10 border-gray-400/20', text: 'text-gray-300', badge: '🥈' },
  3: { bg: 'bg-orange-700/10 border-orange-700/20', text: 'text-orange-400', badge: '🥉' },
}

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const [standings, setStandings] = useState<StandingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStandings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getStandings()
      setStandings(data)
    } catch {
      setError('Failed to load standings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Leaderboard</h1>
            <p className="text-gray-500 text-xs">Tournament Standings</p>
          </div>
        </div>
        <img
          src="/logo.png"
          alt="Shining Star United"
          className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/40"
        />
      </motion.header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card h-14 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 gap-4"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <p>{error}</p>
            </div>
            <button onClick={fetchStandings} className="btn-primary">
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </motion.div>
        ) : standings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500"
          >
            <Trophy className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-medium">No standings yet</p>
            <p className="text-sm mt-1">Standings will appear once matches are completed</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium w-10">#</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Team</th>
                    <th className="text-center px-3 py-3 text-gray-500 font-medium">P</th>
                    <th className="text-center px-3 py-3 text-gray-500 font-medium">W</th>
                    <th className="text-center px-3 py-3 text-gray-500 font-medium">D</th>
                    <th className="text-center px-3 py-3 text-gray-500 font-medium">L</th>
                    <th className="text-center px-3 py-3 text-gray-500 font-medium">GF</th>
                    <th className="text-center px-3 py-3 text-gray-500 font-medium">GA</th>
                    <th className="text-center px-3 py-3 text-gray-500 font-medium">GD</th>
                    <th className="text-center px-3 py-3 text-orange-400 font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, idx) => {
                    const rank = idx + 1
                    const style = RANK_STYLES[rank]
                    return (
                      <motion.tr
                        key={team.team_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`border-b border-white/5 last:border-0 transition-colors hover:bg-white/5
                          ${style ? `${style.bg} border-l-2` : ''}`}
                      >
                        <td className="px-4 py-3">
                          {style ? (
                            <span className="text-lg">{style.badge}</span>
                          ) : (
                            <span className="text-gray-500">{rank}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${style ? style.text : 'text-white'}`}>
                            {team.team_name}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-300">{team.played}</td>
                        <td className="px-3 py-3 text-center text-green-400">{team.wins}</td>
                        <td className="px-3 py-3 text-center text-gray-400">{team.draws}</td>
                        <td className="px-3 py-3 text-center text-red-400">{team.losses}</td>
                        <td className="px-3 py-3 text-center text-gray-300">{team.goals_scored}</td>
                        <td className="px-3 py-3 text-center text-gray-300">{team.goals_conceded}</td>
                        <td className="px-3 py-3 text-center text-gray-300">
                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-orange-400 text-base">
                          {team.points}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
