import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { trackVisit } from '../api/analytics'
import { getTournamentDate } from '../api/settings'
import { Trophy, Calendar, MapPin, Users, ChevronRight, ArrowRight, CheckCircle, Radio } from 'lucide-react'

const TOURNAMENT = {
  name: 'Shining Star United',
  edition: '2025 Championship',
  date: 'June 15–22, 2025',
  venue: 'Rongbong Ronghang Playground',
  prize: '₹8,000',
  runnerUp: '₹4,000',
  manOfTournament: '₹500',
  bestKeeper: '₹500',
  totalPrize: '₹13,000',
  maxTeams: 32,
  deadline: 'May 31, 2025',
  // Tournament start date for countdown
  startDate: new Date('2025-06-15T08:00:00'),
}
const PRIZES = [
  { place: '🥇 Winner', amount: '₹8,000', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30' },
  { place: '🥈 Runner-Up', amount: '₹4,000', color: 'from-gray-400/20 to-gray-500/10 border-gray-400/30' },
  { place: '🏅 Man of the Tournament', amount: '₹500', color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' },
  { place: '🧤 Best Keeper', amount: '₹500', color: 'from-green-500/20 to-green-600/10 border-green-500/30' },
]

const STEPS = [
  { n: '01', title: 'Register Team', desc: 'Fill in your team and manager details.' },
  { n: '02', title: 'Add Players', desc: 'Submit your complete player roster.' },
  { n: '03', title: 'Pay & Submit', desc: 'Complete UPI payment and upload proof.' },
  { n: '04', title: 'Get Approved', desc: 'Admin verifies and confirms your spot.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [targetDate, setTargetDate] = useState<Date>(TOURNAMENT.startDate)

  // Fetch countdown date from backend
  useEffect(() => {
    getTournamentDate().then((d) => {
      setTargetDate(new Date(d.tournament_start))
    }).catch(() => {}) // fallback to default
  }, [])

  // Live countdown
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, secs: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) return { days: 0, hrs: 0, mins: 0, secs: 0 }
      return {
        days: Math.floor(diff / 86400000),
        hrs: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      }
    }
    setCountdown(calc())
    const t = setInterval(() => setCountdown(calc()), 1000)
    return () => clearInterval(t)
  }, [targetDate])

  useEffect(() => { trackVisit('home') }, [])
  return (
    <div className="min-h-screen bg-[#0a0e1a] overflow-x-hidden text-white">

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3
                   bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5"
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SSU" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-orange-500 shrink-0" />
          <span className="font-black text-white text-sm sm:text-base hidden xs:block tracking-wide">
            <span className="hidden sm:inline">SHINING STAR </span>
            <span className="text-orange-500 sm:inline hidden">UNITED</span>
            <span className="sm:hidden text-orange-500">SSU</span>
          </span>
        </div>

        {/* Nav links — hidden on very small screens, shown from sm */}
        <div className="hidden sm:flex items-center gap-1">
          {[
            { label: 'Fixtures', path: '/fixtures' },
            { label: 'Leaderboard', path: '/leaderboard' },
          ].map(({ label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="text-gray-300 hover:text-orange-400 text-sm font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate('/live')}
            className="flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </button>
        </div>

        {/* Mobile: just Live dot + Register */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => navigate('/live')}
            className="flex items-center gap-1 text-green-400 text-xs font-medium px-2 py-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </button>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/register')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          Register
        </motion.button>
      </motion.nav>

      {/* ══════════════════════════════════════════════
          HERO — full viewport, stadium feel
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Dark stadium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050810] via-[#0d1525] to-[#050810]" />

        {/* Stadium light rays */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-blue-500/20 via-transparent to-transparent transform -rotate-12 blur-sm" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-blue-400/15 via-transparent to-transparent blur-sm" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-blue-500/20 via-transparent to-transparent transform rotate-12 blur-sm" />
        </div>

        {/* Pitch lines overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px)',
          }}
        />

        {/* Glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none"
        />

        {/* ── Left: Text content ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          <div className="flex-1 max-w-xl w-full text-center lg:text-left">
            {/* Welcome tag */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-orange-500 font-bold text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4"
            >
              ★ Welcome
            </motion.p>

            {/* Main title */}
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black leading-none mb-4 sm:mb-6 uppercase"
            >
              <span className="text-white">Shining</span>
              <br />
              <span className="text-white">Star</span>
              <br />
              <span className="text-orange-500">United</span>
            </motion.h1>

            {/* Memorial banner */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-4 sm:mb-6 px-4 py-3 border-l-4 border-orange-500 bg-orange-500/10 rounded-r-xl text-left"
            >
              <p className="text-white font-bold text-sm leading-relaxed">
                1st Lt. Solomon Timung &amp; Lt. Mongolsing Hanse,
              </p>
              <p className="text-orange-400 font-semibold text-xs sm:text-sm">Memorial Football Tournament</p>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed"
            >
              {TOURNAMENT.date} · {TOURNAMENT.venue}. Up to {TOURNAMENT.maxTeams} teams compete for ₹13,000 in prizes.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center lg:items-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base"
              >
                Register Your Team
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/fixtures')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/20 hover:border-orange-500/50 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base hover:bg-white/5"
              >
                View Fixtures
              </motion.button>
            </motion.div>
          </div>

          {/* ── Right: Countdown + quick links ── */}
          <div className="flex-shrink-0 w-full sm:w-96 lg:w-80 flex flex-col gap-4">

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-[#0d1525]/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-orange-500 font-bold text-xs tracking-widest uppercase">Tournament Starts In</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { val: countdown.days, label: 'Days' },
                  { val: countdown.hrs, label: 'Hrs' },
                  { val: countdown.mins, label: 'Mins' },
                  { val: countdown.secs, label: 'Secs' },
                ].map(({ val, label }) => (
                  <div key={label} className="bg-[#050810] rounded-xl p-2 sm:p-3">
                    <p className="text-xl sm:text-2xl font-black text-white tabular-nums">
                      {String(val).padStart(2, '0')}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500 text-center">
                {TOURNAMENT.maxTeams} Teams · {TOURNAMENT.venue}
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-[#0d1525]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
            >
              {[
                { icon: Calendar, label: 'Match Fixtures', sub: 'View all scheduled matches', path: '/fixtures', color: 'text-blue-400' },
                { icon: Radio, label: 'Live Scores', sub: 'Real-time match updates', path: '/live', color: 'text-green-400' },
                { icon: Trophy, label: 'Leaderboard', sub: 'Tournament standings', path: '/leaderboard', color: 'text-yellow-400' },
              ].map(({ icon: Icon, label, sub, path, color }, i) => (
                <motion.button
                  key={label}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}
                >
                  <div className={`p-2 rounded-lg bg-white/5 ${color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{label}</p>
                    <p className="text-gray-500 text-xs">{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                </motion.button>
              ))}
            </motion.div>

          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0e1a] to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════ */}
      <section className="bg-orange-500 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-2 sm:gap-8 text-center">
          {[
            { val: `${TOURNAMENT.maxTeams}`, label: 'Teams' },
            { val: '₹13K', label: 'Prize Pool' },
            { val: '8', label: 'Days' },
            { val: '₹801', label: 'Entry' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-lg sm:text-2xl font-black text-white">{val}</p>
              <p className="text-orange-200 text-xs font-medium uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TOURNAMENT DETAILS
      ══════════════════════════════════════════════ */}
      <section id="details" className="py-20 px-6 bg-[#0d1525]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-orange-500 font-bold text-xs tracking-[0.3em] uppercase mb-2">Tournament Info</p>
            <h2 className="text-4xl font-black text-white uppercase">Details</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { icon: Calendar, label: 'Dates', value: TOURNAMENT.date, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
              { icon: MapPin, label: 'Venue', value: TOURNAMENT.venue, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
              { icon: Users, label: 'Max Teams', value: `${TOURNAMENT.maxTeams} Teams`, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
              { icon: Trophy, label: 'Entry Fee', value: '₹801 per team', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-xl border ${color} flex items-start gap-4`}
              >
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white font-bold text-sm">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prize Pool */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-orange-500 font-bold text-xs tracking-[0.3em] uppercase mb-2">Rewards</p>
            <h3 className="text-3xl font-black text-white uppercase mb-8">Prize Pool</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PRIZES.map(({ place, amount, color }, i) => (
                <motion.div
                  key={place}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-xl bg-gradient-to-br border text-center ${color}`}
                >
                  <p className="text-3xl mb-2">{place.split(' ')[0]}</p>
                  <p className="text-white font-semibold text-xs mb-2">{place.split(' ').slice(1).join(' ')}</p>
                  <p className="text-2xl font-black text-orange-400">{amount}</p>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between"
            >
              <span className="text-white font-bold">🏆 Total Prize Pool</span>
              <span className="text-2xl font-black text-orange-400">₹13,000</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW TO REGISTER
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#0a0e1a]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-orange-500 font-bold text-xs tracking-[0.3em] uppercase mb-2">Process</p>
            <h2 className="text-4xl font-black text-white uppercase">How to Register</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="p-6 rounded-xl border border-white/5 bg-[#0d1525] hover:border-orange-500/30 transition-colors h-full">
                  <div className="text-6xl font-black text-orange-500/20 group-hover:text-orange-500/40 transition-colors mb-4 leading-none">{n}</div>
                  <h3 className="text-white font-bold mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-orange-500/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#0d1525]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-red-700 p-8 sm:p-12 text-center"
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative z-10">
              <p className="text-orange-200 font-bold text-xs tracking-[0.3em] uppercase mb-3">Don't Miss Out</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white uppercase mb-4">Ready to Compete?</h2>
              <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
                Registration closes <strong>{TOURNAMENT.deadline}</strong>. Win your share of <strong>₹13,000</strong>!
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-orange-600 font-black text-lg hover:bg-orange-50 transition-colors shadow-2xl"
              >
                Register Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-orange-200 text-sm">
                {['Free to browse', 'Instant confirmation', 'Secure payment'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="bg-[#050810] border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SSU" className="w-8 h-8 rounded-full object-cover border border-orange-500/40" />
            <div>
              <p className="text-white font-bold text-sm">Shining Star United</p>
              <p className="text-gray-600 text-xs">© 2025 All rights reserved.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <button onClick={() => navigate('/fixtures')} className="text-gray-500 hover:text-orange-400 transition-colors">Fixtures</button>
            <button onClick={() => navigate('/leaderboard')} className="text-gray-500 hover:text-orange-400 transition-colors">Leaderboard</button>
            <button onClick={() => navigate('/live')} className="text-gray-500 hover:text-orange-400 transition-colors">Live</button>
            <a href="/admin/login" className="text-gray-500 hover:text-orange-400 transition-colors">Admin</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
