import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { trackVisit } from '../api/analytics'
import { Trophy, Medal, Award, Target, ArrowLeft } from 'lucide-react'

interface Trophy {
  id: number
  name: string
  year: number
  position: string
  icon: string
  description: string
  achievement: string
}

const TROPHIES: Trophy[] = [
  {
    id: 1,
    name: 'Champions Trophy',
    year: 2026,
    position: '1st',
    icon: '🥇',
    description: 'SSU FC Champions Trophy 2026',
    achievement: 'Tournament Winners'
  },
  {
    id: 2,
    name: 'Runner-Up Trophy',
    year: 2025,
    position: '2nd',
    icon: '🥈',
    description: 'SSU FC Championship 2025',
    achievement: 'Runner-Up Finish'
  },
  {
    id: 3,
    name: 'Best Player Award',
    year: 2026,
    position: 'POT',
    icon: '⭐',
    description: 'Player of Tournament',
    achievement: 'Thekphrong Hanse'
  },
  {
    id: 4,
    name: 'Best Goalkeeper',
    year: 2026,
    position: 'GK',
    icon: '🧤',
    description: 'Best Goalkeeper Award',
    achievement: 'Sarmon Lekthe'
  },
]

export default function TrophyRoomPage() {
  const navigate = useNavigate()

  const bg = '#080c08'
  const bgCard = 'rgba(17,31,17,0.85)'
  const border = 'rgba(255,255,255,0.06)'
  const textMain = '#f0f4f0'
  const textMute = '#6b7a6b'

  useEffect(() => {
    trackVisit('trophy_room')
  }, [])

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
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 style={{ color: textMain }} className="text-4xl sm:text-5xl font-black uppercase">
              Trophy Room
            </h1>
            <p style={{ color: textMute }} className="text-sm mt-2">
              Achievements and accolades
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <section style={{ backgroundColor: '#0e1a0e' }} className="py-8 px-4 sm:px-6 mb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Trophies', value: '4', icon: Trophy },
            { label: 'Championships', value: '1', icon: Medal },
            { label: 'Awards', value: '2', icon: Award },
            { label: 'Since', value: '2025', icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: bgCard, borderColor: border }}
              className="border rounded-xl p-4 text-center"
            >
              <Icon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p style={{ color: textMute }} className="text-xs uppercase tracking-wide mb-1">{label}</p>
              <p style={{ color: textMain }} className="text-2xl font-black">{value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trophies Grid */}
      <section style={{ backgroundColor: bg }} className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {TROPHIES.map((trophy, idx) => (
              <motion.div
                key={trophy.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                style={{ backgroundColor: bgCard, borderColor: border }}
                className="border rounded-2xl overflow-hidden"
              >
                {/* Trophy Card */}
                <div className="relative h-48 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center overflow-hidden">
                  {/* Glow effect */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent"
                  />

                  {/* Trophy Icon */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl z-10"
                  >
                    {trophy.icon}
                  </motion.div>
                </div>

                {/* Trophy Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 style={{ color: textMain }} className="text-xl font-black mb-1">
                        {trophy.name}
                      </h3>
                      <p style={{ color: textMute }} className="text-sm">{trophy.year}</p>
                    </div>
                    <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-3 py-2">
                      <p className="text-sm font-black text-yellow-400">{trophy.position}</p>
                    </div>
                  </div>

                  <p style={{ color: textMute }} className="text-sm mb-3">
                    {trophy.description}
                  </p>

                  <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }} className="border rounded-lg p-3">
                    <p style={{ color: textMute }} className="text-xs uppercase tracking-wide mb-1">Achievement</p>
                    <p className="text-green-400 font-bold text-sm">{trophy.achievement}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ backgroundColor: '#0e1a0e', borderColor: border }}
            className="border rounded-2xl p-8"
          >
            <h2 style={{ color: textMain }} className="text-2xl font-black mb-6">Tournament History</h2>

            <div className="space-y-4">
              {[
                { year: 2026, status: 'Champions', teams: 32, matches: 4, wins: 4 },
                { year: 2025, status: 'Runner-Up', teams: 28, matches: 3, wins: 2 },
              ].map((record) => (
                <motion.div
                  key={record.year}
                  whileHover={{ x: 4 }}
                  style={{ backgroundColor: bgCard, borderColor: border }}
                  className="border rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-black text-green-400">{record.year}</div>
                    <div>
                      <p style={{ color: textMain }} className="font-bold">{record.status}</p>
                      <p style={{ color: textMute }} className="text-sm">{record.teams} Teams</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p style={{ color: textMain }} className="text-sm font-semibold">{record.wins}W-{record.matches - record.wins}L</p>
                    <p style={{ color: textMute }} className="text-xs">{record.matches} Matches</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
