import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { trackVisit } from '../api/analytics'
import { getAllSettings } from '../api/settings'
import { Trophy, Calendar, MapPin, Users, ChevronRight, ArrowRight, CheckCircle, Radio } from 'lucide-react'
import ThemeToggle from '../components/shared/ThemeToggle'
import { useTheme } from '../context/ThemeContext'

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
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [targetDate, setTargetDate] = useState<Date>(TOURNAMENT.startDate)
  const [bannerLine1, setBannerLine1] = useState('Shining Star United FC')
  const [bannerLine2, setBannerLine2] = useState('Football Tournament')

  // Fetch all settings from backend
  useEffect(() => {
    getAllSettings().then((s) => {
      setTargetDate(new Date(s.tournament_start))
      setBannerLine1(s.banner_line1)
      setBannerLine2(s.banner_line2)
    }).catch(() => {})
  }, [])

  // Live countdown
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, secs: 0 })
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) {
        setStarted(true)
        return { days: 0, hrs: 0, mins: 0, secs: 0 }
      }
      setStarted(false)
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
    <div className={`min-h-screen overflow-x-hidden text-white transition-colors duration-300 ${isLight ? 'bg-[#e8f5e9]' : 'bg-[#081508]'}`}>

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-xl border-b transition-colors duration-300 ${isLight ? 'bg-white/95 border-gray-200' : 'bg-[#050a05]/90 border-white/5'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SSU" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-orange-500 shrink-0" />
          <span className={`font-black text-sm sm:text-base hidden xs:block tracking-wide ${isLight ? 'text-gray-900' : 'text-white'}`}>
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Register
          </motion.button>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════
          HERO — full viewport, stadium feel
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* ── Video background ── */}
        {!isLight && (
          <div className="absolute inset-0 overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute w-full h-full object-cover pointer-events-none"
              style={{ opacity: 0.55 }}
            >
              <source src="/stadium.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay so text stays readable */}
            <div className="absolute inset-0 bg-black/60" />
            {/* Green tint at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3"
              style={{ background: 'linear-gradient(0deg, rgba(5,20,5,0.85) 0%, transparent 100%)' }} />
          </div>
        )}

        {/* ── Stadium night background — hidden in light mode ── */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isLight ? 'opacity-0' : 'opacity-100'}`}>
          {/* Base dark sky — shown as fallback if video doesn't load */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #050a0f 0%, #0a1a0a 55%, #0d2010 70%, #081508 100%)' }} />

        {/* Pitch green ground — bottom third */}
        <div className="absolute bottom-0 left-0 right-0 h-[38%]" style={{
          background: 'linear-gradient(180deg, #0d2010 0%, #0f2a12 30%, #112e14 60%, #0a1f0c 100%)',
        }} />

        {/* Pitch line markings */}
        <div className="absolute bottom-0 left-0 right-0 h-[38%] overflow-hidden opacity-20">
          {/* Centre circle */}
          <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full border border-white/40" />
          {/* Centre spot */}
          <div className="absolute bottom-[46%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/60" />
          {/* Halfway line */}
          <div className="absolute bottom-0 left-1/2 w-px h-full bg-white/30" />
          {/* Left penalty box */}
          <div className="absolute bottom-0 left-0 w-[22%] h-[55%] border-r border-t border-white/30" />
          {/* Right penalty box */}
          <div className="absolute bottom-0 right-0 w-[22%] h-[55%] border-l border-t border-white/30" />
          {/* Pitch stripes */}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((p) => (
            <div key={p} className="absolute bottom-0 top-0 w-[11.1%] odd:bg-white/[0.03]" style={{ left: `${p - 10}%` }} />
          ))}
        </div>

        {/* Floodlight glow — top left */}
        <div className="absolute top-0 left-[15%] w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(255,240,180,0.18) 0%, rgba(255,220,100,0.08) 30%, transparent 70%)' }} />
        {/* Floodlight glow — top right */}
        <div className="absolute top-0 right-[15%] w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(255,240,180,0.18) 0%, rgba(255,220,100,0.08) 30%, transparent 70%)' }} />
        {/* Floodlight glow — top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(200,220,255,0.12) 0%, rgba(150,180,255,0.05) 40%, transparent 70%)' }} />

        {/* Light cone rays from top */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-[14%] w-1 h-[60%] opacity-20"
            style={{ background: 'linear-gradient(180deg, rgba(255,240,180,0.8) 0%, transparent 100%)', transform: 'rotate(8deg)', transformOrigin: 'top center', filter: 'blur(3px)' }} />
          <div className="absolute top-0 right-[14%] w-1 h-[60%] opacity-20"
            style={{ background: 'linear-gradient(180deg, rgba(255,240,180,0.8) 0%, transparent 100%)', transform: 'rotate(-8deg)', transformOrigin: 'top center', filter: 'blur(3px)' }} />
          <div className="absolute top-0 left-[48%] w-1 h-[55%] opacity-15"
            style={{ background: 'linear-gradient(180deg, rgba(200,220,255,0.8) 0%, transparent 100%)', filter: 'blur(4px)' }} />
        </div>

        {/* Crowd silhouette — top edge */}
        <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden opacity-30">
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,64 L0,40 Q20,30 40,38 Q60,46 80,35 Q100,24 120,32 Q140,40 160,28 Q180,16 200,26 Q220,36 240,24 Q260,12 280,22 Q300,32 320,20 Q340,8 360,18 Q380,28 400,16 Q420,4 440,14 Q460,24 480,12 Q500,0 520,10 Q540,20 560,8 Q580,0 600,10 Q620,20 640,8 Q660,0 680,12 Q700,24 720,12 Q740,0 760,12 Q780,24 800,12 Q820,0 840,10 Q860,20 880,8 Q900,0 920,12 Q940,24 960,12 Q980,0 1000,10 Q1020,20 1040,8 Q1060,0 1080,12 Q1100,24 1120,14 Q1140,4 1160,16 Q1180,28 1200,18 Q1220,8 1240,20 Q1260,32 1280,22 Q1300,12 1320,24 Q1340,36 1360,26 Q1380,16 1400,28 Q1420,40 1440,32 L1440,64 Z"
              fill="#0a1a0a" />
          </svg>
        </div>

        {/* Ambient green pitch reflection on lower half */}
        <div className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none"
          style={{ background: 'linear-gradient(0deg, rgba(10,40,15,0.4) 0%, transparent 100%)' }} />

        {/* Subtle fog/mist layer */}
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[30%] left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 70%, transparent)', filter: 'blur(8px)' }}
        />
        </div>{/* end stadium background wrapper */}

        {/* Light mode background */}
        {isLight && (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #bbf7d0 0%, #dcfce7 40%, #a7f3d0 70%, #6ee7b7 100%)',
          }} />
        )}

        {/* ── Left: Text content ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          <div className="flex-1 max-w-xl w-full text-center lg:text-left">
            {/* Welcome tag */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-orange-500 font-bold text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4"            >
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
              <span className="text-orange-500">United FC</span>
            </motion.h1>

            {/* Memorial banner */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-4 sm:mb-6 px-4 py-3 border-l-4 border-orange-500 bg-orange-500/10 rounded-r-xl text-left"
            >
              <p className="text-white font-bold text-sm leading-relaxed">{bannerLine1}</p>
              <p className="text-orange-400 font-semibold text-xs sm:text-sm">{bannerLine2}</p>
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
              className="bg-[#0a1a0a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-orange-500 font-bold text-xs tracking-widest uppercase">
                  {started ? 'Tournament is Live!' : 'Tournament Starts In'}
                </p>
              </div>
              {started ? (
                <div className="text-center py-2">
                  <p className="text-2xl font-black text-green-400">🏆 Underway!</p>
                  <p className="text-gray-500 text-xs mt-1">The tournament has started</p>
                </div>
              ) : (
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { val: countdown.days, label: 'Days' },
                  { val: countdown.hrs, label: 'Hrs' },
                  { val: countdown.mins, label: 'Mins' },
                  { val: countdown.secs, label: 'Secs' },
                ].map(({ val, label }) => (
                  <div key={label} className="bg-[#050a05] rounded-xl p-2 sm:p-3">
                    <p className="text-xl sm:text-2xl font-black text-white tabular-nums">
                      {String(val).padStart(2, '0')}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              )}
              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500 text-center">
                {TOURNAMENT.maxTeams} Teams · {TOURNAMENT.venue}
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-[#0a1a0a]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
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
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#081508] to-transparent pointer-events-none" />
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
      <section id="details" className={`py-20 px-6 transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-[#0a1a0a]'}`}>
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
      <section className={`py-20 px-6 transition-colors duration-300 ${isLight ? 'bg-gray-50' : 'bg-[#081508]'}`}>
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
      <section className={`py-20 px-6 transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-[#0a1a0a]'}`}>
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
      <footer className={`border-t py-8 px-6 transition-colors duration-300 ${isLight ? 'bg-white border-gray-200' : 'bg-[#050a05] border-white/5'}`}>
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
