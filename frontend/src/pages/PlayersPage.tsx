import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { trackVisit } from '../api/analytics'
import { Star, Target, Shield, Zap, ArrowLeft, Search } from 'lucide-react'

interface PlayerCard {
  id: number
  name: string
  position: string
  number: number
  rating: number
  team: string
  image: string
  stats: {
    pace: number
    shooting: number
    passing: number
    dribbling: number
    defense: number
    physical: number
  }
}

const SAMPLE_PLAYERS: PlayerCard[] = [
  {
    id: 1,
    name: 'Thekphrong Hanse',
    position: 'ST',
    number: 9,
    rating: 87,
    team: 'SSU FC',
    image: '/logo.svg',
    stats: { pace: 88, shooting: 85, passing: 78, dribbling: 82, defense: 45, physical: 80 }
  },
  {
    id: 2,
    name: 'Diamond Tokbi',
    position: 'MF',
    number: 10,
    rating: 84,
    team: 'SSU FC',
    image: '/logo.svg',
    stats: { pace: 85, shooting: 80, passing: 86, dribbling: 84, defense: 55, physical: 78 }
  },
  {
    id: 3,
    name: 'Jeffry Timung',
    position: 'DF',
    number: 4,
    rating: 82,
    team: 'SSU FC',
    image: '/logo.svg',
    stats: { pace: 80, shooting: 50, passing: 75, dribbling: 60, defense: 88, physical: 85 }
  },
  {
    id: 4,
    name: 'Sarmon Lekthe',
    position: 'GK',
    number: 1,
    rating: 85,
    team: 'SSU FC',
    image: '/logo.svg',
    stats: { pace: 60, shooting: 30, passing: 70, dribbling: 50, defense: 82, physical: 88 }
  },
]

export default function PlayersPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCard | null>(null)
  const [filteredPlayers, setFilteredPlayers] = useState(SAMPLE_PLAYERS)

  const bg = '#080c08'
  const bgCard = 'rgba(17,31,17,0.85)'
  const border = 'rgba(255,255,255,0.06)'
  const textMain = '#f0f4f0'
  const textMute = '#6b7a6b'

  useEffect(() => {
    trackVisit('players')
  }, [])

  useEffect(() => {
    setFilteredPlayers(
      SAMPLE_PLAYERS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm])

  const getStatColor = (value: number) => {
    if (value >= 85) return '#22c55e'
    if (value >= 75) return '#3b82f6'
    if (value >= 65) return '#f59e0b'
    return '#ef4444'
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
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center">
            <Star className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h1 style={{ color: textMain }} className="text-4xl sm:text-5xl font-black uppercase">
              Player Cards
            </h1>
            <p style={{ color: textMute }} className="text-sm mt-2">
              FIFA-style player ratings and statistics
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <section style={{ backgroundColor: '#0e1a0e' }} className="py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: textMute }} />
            <input
              type="text"
              placeholder="Search by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: bgCard, borderColor: border, color: textMain }}
              className="w-full pl-12 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </motion.div>
        </div>
      </section>

      {/* Player Cards Grid */}
      <section style={{ backgroundColor: bg }} className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlayers.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedPlayer(player)}
                whileHover={{ y: -8, scale: 1.02 }}
                style={{ backgroundColor: bgCard, borderColor: border }}
                className="rounded-2xl border overflow-hidden cursor-pointer transition-all group"
              >
                {/* Card Background */}
                <div className="relative h-80 bg-gradient-to-br from-green-500/10 to-blue-500/10 overflow-hidden">
                  {/* Player Image */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Position Badge */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white font-black text-sm px-3 py-1 rounded-full">
                    {player.position}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <p className="text-3xl font-black text-green-400">{player.rating}</p>
                  </div>

                  {/* Jersey Number */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-3">
                    <p className="text-6xl font-black text-green-500/30">{player.number}</p>
                  </div>
                </div>

                {/* Player Info */}
                <div className="p-4">
                  <h3 style={{ color: textMain }} className="font-black text-sm mb-1 truncate">
                    {player.name}
                  </h3>
                  <p style={{ color: textMute }} className="text-xs mb-4">{player.team}</p>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'PAC', value: player.stats.pace },
                      { label: 'SHO', value: player.stats.shooting },
                      { label: 'PAS', value: player.stats.passing },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p style={{ color: textMute }} className="text-xs">{label}</p>
                        <p style={{ color: getStatColor(value) }} className="font-black text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p style={{ color: textMute }} className="text-lg">No players found</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Detailed Player Modal */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: bgCard, borderColor: border }}
            className="rounded-3xl border max-w-2xl w-full overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Left - Stats */}
              <div>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
                    <img src={selectedPlayer.image} alt={selectedPlayer.name} className="w-full h-full object-cover rounded-2xl" />
                  </div>
                  <h2 style={{ color: textMain }} className="text-3xl font-black mb-2">
                    {selectedPlayer.name}
                  </h2>
                  <p style={{ color: textMute }} className="text-sm mb-4">{selectedPlayer.position} • {selectedPlayer.team}</p>
                  <div className="inline-block bg-green-500/20 border border-green-500/40 rounded-xl px-6 py-3">
                    <p style={{ color: textMain }} className="text-xs uppercase tracking-wider">Overall Rating</p>
                    <p className="text-5xl font-black text-green-400">{selectedPlayer.rating}</p>
                  </div>
                </div>
              </div>

              {/* Right - Detailed Stats */}
              <div>
                <h3 style={{ color: textMain }} className="font-black text-lg mb-6">Detailed Stats</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Pace', value: selectedPlayer.stats.pace, icon: Zap },
                    { label: 'Shooting', value: selectedPlayer.stats.shooting, icon: Target },
                    { label: 'Passing', value: selectedPlayer.stats.passing, icon: Star },
                    { label: 'Dribbling', value: selectedPlayer.stats.dribbling, icon: Star },
                    { label: 'Defense', value: selectedPlayer.stats.defense, icon: Shield },
                    { label: 'Physical', value: selectedPlayer.stats.physical, icon: Zap },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-green-400" />
                          <p style={{ color: textMute }} className="text-sm font-semibold">{label}</p>
                        </div>
                        <p style={{ color: getStatColor(value) }} className="font-black">{value}</p>
                      </div>
                      <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: border }} className="w-full h-2 rounded-full border overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          style={{ backgroundColor: getStatColor(value) }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <p style={{ color: textMain }} className="text-sm">✕</p>
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
