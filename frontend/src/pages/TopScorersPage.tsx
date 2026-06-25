import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Zap, AlertCircle } from 'lucide-react'
import { getTopScorers, type TopScorersResponse } from '../api/topScorers'
import PageLoader from '../components/shared/PageLoader'
import { trackVisit } from '../api/analytics'

export default function TopScorersPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<TopScorersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    trackVisit('top-scorers')
    fetchTopScorers()
  }, [])

  const fetchTopScorers = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTopScorers()
      setData(result)
    } catch {
      setError('Failed to load top scorers')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="text-white font-bold text-lg">Top Performers</h1>
            <p className="text-gray-500 text-xs">Goal Scorers & Assist Leaders</p>
          </div>
        </div>
        <img
          src="/logo.svg"
          alt="Shining Star United"
          className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/40"
        />
      </motion.header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <PageLoader text="Loading top performers..." />
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
            <button onClick={fetchTopScorers} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
              Retry
            </button>
          </motion.div>
        ) : !data || (data.top_scorers.length === 0 && data.top_assists.length === 0) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500 text-center"
          >
            <Trophy className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-medium text-white">No performances yet</p>
            <p className="text-sm mt-1">Check back after matches are completed!</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Top Scorers */}
            {data.top_scorers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white">Top Goal Scorers</h2>
                </div>

                <div className="space-y-3">
                  {data.top_scorers.map((scorer, idx) => (
                    <motion.div
                      key={`scorer-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card p-4 flex items-center justify-between border border-yellow-500/20"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Rank Badge */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{idx + 1}</span>
                        </div>

                        {/* Player Info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-sm truncate">{scorer.player_name}</p>
                          <p className="text-gray-400 text-xs">{scorer.team_name}</p>
                        </div>
                      </div>

                      {/* Goals */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-yellow-400 font-bold text-lg">⚽ {scorer.goals}</p>
                        <p className="text-gray-500 text-xs">Goals</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Top Assists */}
            {data.top_assists.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Top Assist Providers</h2>
                </div>

                <div className="space-y-3">
                  {data.top_assists.map((assist, idx) => (
                    <motion.div
                      key={`assist-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card p-4 flex items-center justify-between border border-green-500/20"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Rank Badge */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{idx + 1}</span>
                        </div>

                        {/* Player Info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-sm truncate">{assist.player_name}</p>
                          <p className="text-gray-400 text-xs">{assist.team_name}</p>
                        </div>
                      </div>

                      {/* Assists */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-green-400 font-bold text-lg">🎯 {assist.assists}</p>
                        <p className="text-gray-500 text-xs">Assists</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
