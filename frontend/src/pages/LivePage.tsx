import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, AlertCircle, Radio, Zap } from 'lucide-react'
import { getMatches, type MatchResponse } from '../api/matches'
import { getMatchEvents, type MatchEventListResponse } from '../api/matchEvents'
import PageLoader from '../components/shared/PageLoader'
import MatchTimer from '../components/MatchTimer'
import { trackVisit } from '../api/analytics'

const AUTO_REFRESH_INTERVAL = 5_000 // 5 seconds for faster updates

export default function LivePage() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState<MatchResponse[]>([])
  const [matchEvents, setMatchEvents] = useState<Record<string, MatchEventListResponse>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchLiveMatches = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await getMatches({ status: 'live' })
      setMatches(data)
      
      // Fetch events for each match
      const events: Record<string, MatchEventListResponse> = {}
      for (const match of data) {
        try {
          events[match.id] = await getMatchEvents(match.id)
        } catch {
          // Continue even if event fetch fails for one match
          console.error(`Failed to fetch events for match ${match.id}`)
        }
      }
      setMatchEvents(events)
      setLastUpdated(new Date())
    } catch {
      setError('Failed to load live matches.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    trackVisit('live')
    fetchLiveMatches()
  }, [fetchLiveMatches])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveMatches()
    }, AUTO_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchLiveMatches])

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
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-lg">Live Scores</h1>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-400"
              />
            </div>
            <p className="text-gray-500 text-xs">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchLiveMatches(true)}
            disabled={refreshing || loading}
            className="btn-secondary py-2 px-3 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
          <img
            src="/logo.svg"
            alt="Shining Star United"
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/40"
          />
        </div>
      </motion.header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <PageLoader text="Loading live matches..." />
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
            <button onClick={() => fetchLiveMatches(true)} className="btn-primary">
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </motion.div>
        ) : matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500 text-center"
          >
            <Radio className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-medium text-white">No live matches right now.</p>
            <p className="text-sm mt-1">Check back during match day!</p>
            <p className="text-xs mt-4 text-gray-600">Auto-refreshes every 30 seconds</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {matches.map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.08 }}
                  className="glass-card p-6 border border-green-500/20"
                >
                  {/* Live badge / Match Timer */}
                  <div className="flex items-center justify-center mb-4">
                    <MatchTimer 
                      matchStartTime={match.match_start_time}
                      status={match.status as 'scheduled' | 'live' | 'completed'}
                      matchEndTime={match.match_end_time}
                      currentMinute={match.current_minute}
                      isExtraTime={match.is_extra_time}
                      isPaused={match.is_paused}
                    />
                  </div>

                  {/* Score display */}
                  <div className="flex items-center justify-between gap-4">
                    {/* Team A */}
                    <div className="flex-1 flex flex-col items-center">
                      {match.team_a_logo && (
                        <img
                          src={match.team_a_logo}
                          alt={match.team_a_name}
                          className="w-16 h-10 rounded object-cover border-2 border-green-500/40 mb-2"
                        />
                      )}
                      <p className="text-white font-bold text-lg sm:text-xl leading-tight text-center">
                        {match.team_a_name}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center gap-2 min-w-[120px]">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl sm:text-6xl font-black text-white tabular-nums">
                          {match.team_a_score ?? 0}
                        </span>
                        <span className="text-3xl text-gray-600 font-light">-</span>
                        <span className="text-5xl sm:text-6xl font-black text-white tabular-nums">
                          {match.team_b_score ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="flex-1 flex flex-col items-center">
                      {match.team_b_logo && (
                        <img
                          src={match.team_b_logo}
                          alt={match.team_b_name}
                          className="w-16 h-10 rounded object-cover border-2 border-green-500/40 mb-2"
                        />
                      )}
                      <p className="text-white font-bold text-lg sm:text-xl leading-tight text-center">
                        {match.team_b_name}
                      </p>
                    </div>
                  </div>

                  {/* Match info */}
                  <div className="mt-4 text-center text-gray-500 text-sm">
                    {match.round} · {match.venue}
                  </div>

                  {/* Events Timeline */}
                  {matchEvents[match.id] && matchEvents[match.id].events.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Match Events
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {matchEvents[match.id].events
                          .sort((a, b) => a.time_minute - b.time_minute)
                          .map((event) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
                            >
                              <span className="text-lg">
                                {event.event_type === 'goal' ? '⚽' : event.event_type === 'yellow_card' ? '🟨' : '🔴'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">{event.player_name}</p>
                                <p className="text-gray-500 text-xs">
                                  {event.team === 'team_a' ? match.team_a_name : match.team_b_name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold text-sm">{event.time_minute}'</p>
                                <p className="text-gray-500 text-xs">
                                  {event.event_type === 'goal' ? 'Goal' : event.event_type === 'yellow_card' ? 'Yellow' : 'Red'}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
