import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, AlertCircle, RefreshCw } from 'lucide-react'
import { getMatches, type MatchResponse } from '../api/matches'
import PageLoader from '../components/shared/PageLoader'
import { trackVisit } from '../api/analytics'

const ROUND_ORDER = [
  'Round of 32',
  'Round of 16',
  'Quarter-Final',
  'Semi-Final',
  'Third Place',
  'Final',
]

export default function FixturesPage() {
  const navigate = useNavigate()
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
      setError('Failed to load fixtures. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    trackVisit('fixtures')
    fetchMatches()
  }, [])

  // Group matches by round
  const groupedMatches = ROUND_ORDER.reduce((acc, round) => {
    const roundMatches = matches.filter((m) => m.round === round)
    if (roundMatches.length > 0) {
      acc[round] = roundMatches
    }
    return acc
  }, {} as Record<string, MatchResponse[]>)

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
            <h1 className="text-white font-bold text-lg">Fixtures</h1>
            <p className="text-gray-500 text-xs">Tournament Schedule</p>
          </div>
        </div>
        <img
          src="/logo.png"
          alt="Shining Star United"
          className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/40"
        />
      </motion.header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <PageLoader text="Loading fixtures..." />
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
            <button onClick={fetchMatches} className="btn-primary">
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </motion.div>
        ) : Object.keys(groupedMatches).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500"
          >
            <Calendar className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-medium">No fixtures scheduled yet</p>
            <p className="text-sm mt-1">Check back soon for the tournament schedule</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMatches).map(([round, roundMatches], idx) => (
              <motion.div
                key={round}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h2 className="text-2xl font-bold gradient-text mb-4">{round}</h2>
                <div className="space-y-3">
                  {roundMatches.map((match) => (
                    <motion.div
                      key={match.id}
                      whileHover={{ scale: 1.01 }}
                      className="glass-card p-5"
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex-1 text-right">
                          <p className="text-white font-semibold text-lg">{match.team_a_name}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          {match.status === 'live' && (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wide">
                              LIVE
                            </span>
                          )}
                          {match.status === 'completed' ? (
                            <div className="flex items-center gap-2 text-2xl font-black text-white">
                              <span>{match.team_a_score}</span>
                              <span className="text-gray-600">-</span>
                              <span>{match.team_b_score}</span>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-sm">vs</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-lg">{match.team_b_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(match.scheduled_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(match.scheduled_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {match.venue}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
