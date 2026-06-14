import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { trackVisit } from '../api/analytics'
import { ArrowLeft, Trophy } from 'lucide-react'

interface Match {
  id: number
  team1: string
  team2: string
  score1?: number
  score2?: number
  winner?: string
  status: 'pending' | 'live' | 'completed'
}

const BRACKET_DATA: { semifinals: Match[]; finals: Match[] } = {
  semifinals: [],
  finals: [],
}

export default function BracketPage() {
  const navigate = useNavigate()

  const bg = '#080c08'
  const bgCard = 'rgba(17,31,17,0.85)'
  const border = 'rgba(255,255,255,0.06)'
  const textMain = '#f0f4f0'
  const textMute = '#6b7a6b'

  useEffect(() => {
    trackVisit('bracket')
  }, [])

  const MatchCard = ({ match, round }: { match: Match; round: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed':
          return 'bg-green-500/20 border-green-500/40'
        case 'live':
          return 'bg-red-500/20 border-red-500/40'
        default:
          return 'bg-blue-500/20 border-blue-500/40'
      }
    }

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'completed':
          return <span className="text-xs font-bold text-green-400">FINISHED</span>
        case 'live':
          return <span className="text-xs font-bold text-red-400 animate-pulse">● LIVE</span>
        default:
          return <span className="text-xs font-bold text-blue-400">UPCOMING</span>
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        style={{ backgroundColor: bgCard, borderColor: border }}
        className={`border rounded-2xl p-4 ${getStatusColor(match.status)}`}
      >
        {/* Round Badge */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: textMute }} className="text-xs uppercase font-bold tracking-wide">
            {round}
          </span>
          {getStatusBadge(match.status)}
        </div>

        {/* Match */}
        <div className="space-y-2">
          {/* Team 1 */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <span style={{ color: textMain }} className="font-bold text-sm truncate">
              {match.team1}
            </span>
            {match.score1 !== undefined && (
              <span className="text-lg font-black text-green-400">{match.score1}</span>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <p style={{ color: textMute }} className="text-xs">VS</p>
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <span style={{ color: textMain }} className="font-bold text-sm truncate">
              {match.team2}
            </span>
            {match.score2 !== undefined && (
              <span className="text-lg font-black text-orange-400">{match.score2}</span>
            )}
          </div>
        </div>

        {/* Winner Badge */}
        {match.winner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t" style={{ borderTopColor: border }}
          >
            <p style={{ color: textMute }} className="text-xs uppercase font-bold mb-2">Advancing</p>
            <p className="text-green-400 font-black text-sm">{match.winner}</p>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div style={{ backgroundColor: bg }} className="min-h-screen overflow-x-hidden text-white pt-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 mb-12"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 style={{ color: textMain }} className="text-4xl sm:text-5xl font-black uppercase">
              Tournament Bracket
            </h1>
            <p style={{ color: textMute }} className="text-sm mt-2">
              SSU Champions Trophy 2026 - July 15
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bracket */}
      <section style={{ backgroundColor: bg }} className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Tournament Structure Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: '#0e1a0e', borderColor: border }}
            className="border rounded-2xl p-6 mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Teams', value: '32' },
                { label: 'Format', value: 'Single Elim.' },
                { label: 'Venue', value: 'Rongbong Ronghang' },
                { label: 'Date', value: 'July 15, 2026' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p style={{ color: textMute }} className="text-xs uppercase tracking-wide mb-2">{label}</p>
                  <p style={{ color: textMain }} className="font-black text-lg">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bracket Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Semifinals */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 style={{ color: textMain }} className="font-black text-lg mb-6 text-center">
                Semifinals
              </h2>
              <div className="space-y-6">
                {BRACKET_DATA.semifinals.length > 0 ? (
                  BRACKET_DATA.semifinals.map((match) => (
                    <MatchCard key={match.id} match={match} round="Semi-Final" />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ backgroundColor: bgCard, borderColor: border }}
                    className="border rounded-2xl p-8 text-center"
                  >
                    <p style={{ color: textMute }}>Bracket not yet available</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Arrow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-green-500 to-green-400"></div>
            </motion.div>

            {/* Finals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 style={{ color: textMain }} className="font-black text-lg mb-6 text-center">
                Finals
              </h2>
              <div className="space-y-6">
                {BRACKET_DATA.finals.length > 0 ? (
                  BRACKET_DATA.finals.map((match) => (
                    <MatchCard key={match.id} match={match} round="Final" />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ backgroundColor: bgCard, borderColor: border }}
                    className="border rounded-2xl p-8 text-center"
                  >
                    <p style={{ color: textMute }}>Bracket not yet available</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { color: 'bg-green-500/20', text: '✓ Completed', desc: 'Match finished' },
              { color: 'bg-red-500/20', text: '● Live', desc: 'Match ongoing' },
              { color: 'bg-blue-500/20', text: '⏳ Upcoming', desc: 'Match pending' },
            ].map(({ color, text, desc }) => (
              <motion.div
                key={text}
                whileHover={{ y: -4 }}
                style={{ backgroundColor: bgCard, borderColor: border }}
                className={`border rounded-xl p-4 text-center ${color}`}
              >
                <p style={{ color: textMain }} className="font-bold text-sm mb-1">{text}</p>
                <p style={{ color: textMute }} className="text-xs">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
