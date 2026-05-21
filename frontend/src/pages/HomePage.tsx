import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { trackVisit } from '../api/analytics'
import { getAllSettings } from '../api/settings'
import { Trophy, Calendar, MapPin, Users, ChevronRight, ArrowRight, CheckCircle, Radio, MessageSquare } from 'lucide-react'
import ToastNotification from '../components/shared/ToastNotification'
import MarqueeNotification from '../components/shared/MarqueeNotification'
// ── Color palette matched to stadium night video ──────────────────────────
// Dark base:    #080c08  (near-black with green tint)
// Mid dark:     #0e1a0e  (deep forest green-black)
// Card bg:      #111f11  (dark green-tinted surface)
// Border:       rgba(255,255,255,0.06)
// Accent warm:  #f97316  (orange — matches floodlight warmth)
// Accent green: #22c55e  (pitch green)
// Text primary: #f0f4f0  (off-white with green tint)
// Text muted:   #6b7a6b  (muted green-grey)

const TOURNAMENT = {
  date: 'July 8, 2026',
  venue: 'Rongbong Ronghang Playground',
  maxTeams: 32,
  deadline: 'June 30, 2026',
  startDate: new Date('2026-07-08T08:00:00'),
}

const STEPS = [
  { n: '01', title: 'Register Team', desc: 'Fill in your team and manager details.' },
  { n: '02', title: 'Add Players', desc: 'Submit your complete player roster.' },
  { n: '03', title: 'Pay & Submit', desc: 'Complete UPI payment and upload proof.' },
  { n: '04', title: 'Get Approved', desc: 'Admin verifies and confirms your spot.' },
]

export default function HomePage() {
  const navigate = useNavigate()

  const [targetDate, setTargetDate] = useState<Date>(TOURNAMENT.startDate)
  const [bannerLine1, setBannerLine1] = useState('Shining Star United FC')
  const [bannerLine2, setBannerLine2] = useState('Football Tournament')
  const [heroLine1, setHeroLine1] = useState('Shining')
  const [heroLine2, setHeroLine2] = useState('Star')
  const [heroLine3, setHeroLine3] = useState('United FC')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    getAllSettings().then((s) => {
      setTargetDate(new Date(s.tournament_start))
      setBannerLine1(s.banner_line1)
      setBannerLine2(s.banner_line2)
      setHeroLine1(s.hero_line1 || 'Shining')
      setHeroLine2(s.hero_line2 || 'Star')
      setHeroLine3(s.hero_line3 || 'United FC')
    }).catch(() => {})
  }, [])

  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, secs: 0 })
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) { setStarted(true); return { days: 0, hrs: 0, mins: 0, secs: 0 } }
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

  // Dark mode only — fixed colors
  const bg       = '#080c08'
  const bgMid    = '#0e1a0e'
  const bgCard   = 'rgba(17,31,17,0.85)'
  const border   = 'rgba(255,255,255,0.06)'
  const textMain = '#f0f4f0'
  const textMute = '#6b7a6b'

  return (
    <div style={{ backgroundColor: bg }} className="min-h-screen overflow-x-hidden text-white">
      {/* ══ TOAST NOTIFICATION ══ */}
      {showToast && (
        <ToastNotification
          message="Refund Policy: Cancel at least 4 days before tournament start for full refund. Cancellations within 4 days are not eligible for refund. Registration fee ₹801 via UPI. Bring Aadhaar or PAN card for verification."
          type="warning"
          onClose={() => setShowToast(false)}
          duration={10000}
        />
      )}

      {/* ══ NAVBAR ══ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor: 'rgba(8,12,8,0.92)', borderBottomColor: border }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-xl border-b transition-colors duration-300"
      >
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SSU" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-orange-500 shrink-0" />
          <span style={{ color: textMain }} className="font-black text-sm sm:text-base hidden sm:block tracking-wide">
            SHINING STAR <span className="text-orange-500">UNITED</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {[{ label: 'Fixtures', path: '/fixtures' }, { label: 'Leaderboard', path: '/leaderboard' }, { label: 'Support', path: '/contact' }].map(({ label, path }) => (
            <button key={label} onClick={() => navigate(path)}
              style={{ color: textMute }}
              className="hover:text-orange-400 text-sm font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
              {label}
            </button>
          ))}
          <button onClick={() => navigate('/live')}
            className="flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
          </button>
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <button onClick={() => navigate('/live')} className="flex items-center gap-1 text-green-400 text-xs font-medium px-2 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
          </button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
            Register
          </motion.button>
        </div>
      </motion.nav>

      {/* ══ MARQUEE NOTIFICATION ══ */}
      <div className="fixed top-14 left-0 right-0 z-40 w-full">
        <MarqueeNotification
          message="Refund Policy: Cancel at least 4 days before tournament start for full refund. Cancellations within 4 days are not eligible for refund. Registration fee ₹801 via UPI. Bring Aadhaar or PAN card for verification."
          backgroundColor="rgba(249, 115, 22, 0.12)"
          textColor="#f97316"
          iconColor="#f97316"
        />
      </div>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">

        {/* Video background */}
        <div className="absolute inset-0 overflow-hidden">
          <video autoPlay muted loop playsInline
            className="absolute w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.85 }}>
            <source src="/stadium.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: 'rgba(8,12,8,0.45)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-1/3"
            style={{ background: 'linear-gradient(0deg, rgba(8,12,8,0.9) 0%, transparent 100%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          {/* Left */}
          <div className="flex-1 max-w-xl w-full text-center lg:text-left">
            <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="text-orange-400 font-bold text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
              ★ Welcome
            </motion.p>

            <motion.h1 initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black leading-none mb-4 sm:mb-6 uppercase"
              style={{ color: textMain }}>
              {heroLine1}<br />{heroLine2}<br /><span className="text-orange-500">{heroLine3}</span>
            </motion.h1>

            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="mb-4 sm:mb-6 px-4 py-3 border-l-4 border-orange-500 rounded-r-xl text-left"
              style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
              <p style={{ color: textMain }} className="font-bold text-sm leading-relaxed">{bannerLine1}</p>
              <p className="text-orange-400 font-semibold text-xs sm:text-sm">{bannerLine2}</p>
            </motion.div>

            <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              style={{ color: textMute }} className="text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
              {TOURNAMENT.date} · {TOURNAMENT.venue}. Up to {TOURNAMENT.maxTeams} teams compete for the championship title.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center lg:items-start">
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249,115,22,0.5)' }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base">
                Register Your Team <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/fixtures')}
                style={{ borderColor: border, color: textMain }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base hover:border-orange-500/50 hover:bg-white/5">
                View Fixtures
              </motion.button>
            </motion.div>
          </div>

          {/* Right: Countdown + links */}
          <div className="flex-shrink-0 w-full sm:w-96 lg:w-80 flex flex-col gap-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              style={{ backgroundColor: bgCard, borderColor: border }}
              className="border rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-orange-400 font-bold text-xs tracking-widest uppercase">
                  {started ? 'Tournament is Live!' : 'Tournament Starts In'}
                </p>
              </div>
              {started ? (
                <div className="text-center py-2">
                  <p className="text-2xl font-black text-green-400">🏆 Underway!</p>
                  <p style={{ color: textMute }} className="text-xs mt-1">The tournament has started</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[{ val: countdown.days, label: 'Days' }, { val: countdown.hrs, label: 'Hrs' }, { val: countdown.mins, label: 'Mins' }, { val: countdown.secs, label: 'Secs' }].map(({ val, label }) => (
                    <div key={label} style={{ backgroundColor: '#050a05' }} className="rounded-xl p-2 sm:p-3">
                      <p style={{ color: textMain }} className="text-xl sm:text-2xl font-black tabular-nums">{String(val).padStart(2, '0')}</p>
                      <p style={{ color: textMute }} className="text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ borderTopColor: border, color: textMute }} className="mt-3 pt-3 border-t text-xs text-center">
                {TOURNAMENT.maxTeams} Teams · {TOURNAMENT.venue}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              style={{ backgroundColor: bgCard, borderColor: border }}
              className="border rounded-2xl overflow-hidden backdrop-blur-sm">
              {[
                { icon: Calendar, label: 'Match Fixtures', sub: 'View all scheduled matches', path: '/fixtures', color: 'text-blue-400' },
                { icon: Radio, label: 'Live Scores', sub: 'Real-time match updates', path: '/live', color: 'text-green-400' },
                { icon: Trophy, label: 'Leaderboard', sub: 'Tournament standings', path: '/leaderboard', color: 'text-yellow-400' },
                { icon: MessageSquare, label: 'Support', sub: 'Contact us with questions', path: '/contact', color: 'text-orange-400' },
              ].map(({ icon: Icon, label, sub, path, color }, i) => (
                <motion.button key={label} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  onClick={() => navigate(path)}
                  style={{ borderTopColor: border }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i > 0 ? 'border-t' : ''}`}>
                  <div className={`p-2 rounded-lg bg-white/5 ${color} shrink-0`}><Icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: textMain }} className="text-sm font-semibold">{label}</p>
                    <p style={{ color: textMute }} className="text-xs">{sub}</p>
                  </div>
                  <ChevronRight style={{ color: textMute }} className="w-4 h-4 shrink-0" />
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: `linear-gradient(0deg, ${bg} 0%, transparent 100%)` }} />
      </section>

      {/* ══ STATS BAR ══ */}
      <section style={{ backgroundColor: '#f97316' }} className="py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2 sm:gap-8 text-center">
          {[{ val: `${TOURNAMENT.maxTeams}`, label: 'Teams' }, { val: '8', label: 'Days' }, { val: '₹801', label: 'Entry' }].map(({ val, label }) => (            <div key={label}>
              <p className="text-lg sm:text-2xl font-black text-white">{val}</p>
              <p className="text-orange-200 text-xs font-medium uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ DETAILS ══ */}
      <section style={{ backgroundColor: bgMid }} className="py-20 px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <p className="text-orange-400 font-bold text-xs tracking-[0.3em] uppercase mb-2">Tournament Info</p>
            <h2 style={{ color: textMain }} className="text-4xl font-black uppercase">Details</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { icon: Calendar, label: 'Dates', value: TOURNAMENT.date, accent: '#3b82f6' },
              { icon: MapPin, label: 'Venue', value: TOURNAMENT.venue, accent: '#22c55e' },
              { icon: Users, label: 'Max Teams', value: `${TOURNAMENT.maxTeams} Teams`, accent: '#a855f7' },
              { icon: Trophy, label: 'Entry Fee', value: '₹801 per team', accent: '#f97316' },
            ].map(({ icon: Icon, label, value, accent }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ backgroundColor: bgCard, borderColor: border, borderLeftColor: accent, borderLeftWidth: 3 }}
                className="p-5 rounded-xl border flex items-start gap-4">
                <Icon style={{ color: accent }} className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p style={{ color: textMute }} className="text-xs uppercase tracking-wider mb-1">{label}</p>
                  <p style={{ color: textMain }} className="font-bold text-sm">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prizes */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-orange-400 font-bold text-xs tracking-[0.3em] uppercase mb-2">Awards</p>
            <h3 style={{ color: textMain }} className="text-3xl font-black uppercase mb-2">Tournament Prizes</h3>
            <p style={{ color: textMute }} className="text-sm mb-8">Money, Trophy &amp; Certificate</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { emoji: '🥇', label: 'Winner', amount: '₹8,000', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
                { emoji: '🥈', label: 'Runner Up', amount: '₹4,000', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
                { emoji: '🏅', label: 'Player of the Tournament', amount: '₹500', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' },
                { emoji: '🧤', label: 'Best Goalkeeper', amount: '₹500', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
              ].map(({ emoji, label, amount, color, bg, border }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  style={{ backgroundColor: bg, borderColor: border, borderWidth: 1, borderStyle: 'solid' }}
                  className="p-5 rounded-2xl text-center">
                  <p className="text-3xl mb-3">{emoji}</p>
                  <p style={{ color: textMute }} className="text-xs font-medium mb-2 leading-tight">{label}</p>
                  <p className="text-2xl font-black" style={{ color }}>{amount}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ HOW TO REGISTER ══ */}
      <section style={{ backgroundColor: bg }} className="py-20 px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <p className="text-orange-400 font-bold text-xs tracking-[0.3em] uppercase mb-2">Process</p>
            <h2 style={{ color: textMain }} className="text-4xl font-black uppercase">How to Register</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div key={n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative group">
                <div style={{ backgroundColor: bgCard, borderColor: border }} className="p-6 rounded-xl border hover:border-orange-500/40 transition-colors h-full">
                  <div className="text-6xl font-black text-orange-500/20 group-hover:text-orange-500/40 transition-colors mb-4 leading-none">{n}</div>
                  <h3 style={{ color: textMain }} className="font-bold mb-2">{title}</h3>
                  <p style={{ color: textMute }} className="text-sm">{desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10">
                    <ChevronRight className="w-5 h-5 text-orange-500/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM PHOTOS ══ */}
      <section style={{ backgroundColor: bg }} className="py-20 px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <p className="text-orange-400 font-bold text-xs tracking-[0.3em] uppercase mb-2">Our Club</p>
            <h2 style={{ color: textMain }} className="text-4xl font-black uppercase">The Team</h2>
            <p style={{ color: textMute }} className="mt-3 text-sm max-w-xl mx-auto">
              Shining Star United FC — representing Hamren with pride on every pitch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
            { src: '/team1.jpg', caption: 'Shining Star United FC' },
              { src: '/team2.jpg', caption: 'Shining Star United FC' },
            ].map(({ src, caption }, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{ backgroundColor: bgCard, borderColor: border }}
                className="rounded-2xl border overflow-hidden group cursor-pointer"
              >
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={src}
                    alt={caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Orange accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p style={{ color: textMain }} className="font-bold text-sm">{caption}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                    ⚽ SSU FC
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RULES & REGULATIONS ══ */}
      <section style={{ backgroundColor: bgMid }} className="py-20 px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <p className="text-orange-400 font-bold text-xs tracking-[0.3em] uppercase mb-2">Official</p>
            <h2 style={{ color: textMain }} className="text-4xl font-black uppercase">Rules & Regulations</h2>
            <p style={{ color: textMute }} className="mt-2 text-sm">SSU Champions Trophy — As per Assam Football Association / AIFF Guidelines</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { num: '01', title: 'Laws of the Game', body: 'All matches played per official FIFA/AIFF Laws adopted by Assam Football Association.' },
              { num: '02', title: 'Team & Players', body: 'Up to 15–18 players per team. Only registered players may play. A player cannot represent more than one team.' },
              { num: '03', title: 'Player Identification', body: 'Valid ID proof required if asked. Any fake player leads to immediate disqualification.' },
              { num: '04', title: 'Match Duration', body: '60 minutes per match (30–30 halves). 5–10 minute break between halves.' },
              { num: '05', title: 'Equipment', body: 'Jersey, shorts, socks, shin guards mandatory. No dangerous items allowed.' },
              { num: '06', title: 'Substitution Rules', body: 'Rolling substitutions allowed as per local tournament rules.' },
              { num: '07', title: 'Referee Authority', body: 'Official referee controls the match. Referee decision is final and binding.' },
              { num: '08', title: 'Discipline', body: 'Yellow card = warning. Two yellows = next match suspension. Red card = direct suspension by committee.' },
              { num: '09', title: 'Reporting Time', body: 'Teams must report 30 minutes before match. Late teams may be given a walkover.' },
              { num: '10', title: 'Match Result', body: 'Draw → Direct penalty shootout. No extra time unless decided by organizers.' },
              { num: '11', title: 'Protest & Appeal', body: 'Protests must be submitted immediately after the match. Organizing committee decision is final.' },
              { num: '12', title: 'Misconduct', body: 'Indiscipline, fighting, or abuse leads to disqualification.' },
              { num: '13', title: 'Organizer Rights', body: 'Organizing committee reserves the right to modify rules if necessary.' },
            ].map(({ num, title, body }, i) => (
              <motion.div key={num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                style={{ backgroundColor: 'rgba(17,31,17,0.7)', borderColor: border }}
                className="p-4 rounded-xl border flex gap-3">
                <span className="text-2xl font-black text-orange-500/30 leading-none shrink-0 w-8">{num}</span>
                <div>
                  <p style={{ color: textMain }} className="font-bold text-sm mb-1">{title}</p>
                  <p style={{ color: textMute }} className="text-xs leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Note */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-xl border border-orange-500/30 text-center"
            style={{ backgroundColor: 'rgba(249,115,22,0.08)' }}>
            <p className="text-orange-400 font-bold text-sm">
              ⚽ Fair play, discipline, and respect must be maintained as per AFA standards. Thank you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ OFFICIAL BEARERS ══ */}
      <section style={{ backgroundColor: bgMid }} className="py-20 px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <p className="text-emerald-400 font-bold text-xs tracking-[0.3em] uppercase mb-2">SSU FC</p>
            <h2 style={{ color: textMain }} className="text-4xl font-black uppercase">Office Bearers</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { no: '01', name: 'Thekphrong Hanse', role: 'President', phone: '+91 88227 16085', color: '#10b981' },
              { no: '02', name: 'Diamond Tokbi', role: 'Vice President', phone: '+91 70865 90897', color: '#06b6d4' },
              { no: '03', name: 'Jeffry Timung', role: 'General Secretary', phone: '+91 87873 66031', color: '#3b82f6' },
              { no: '04', name: 'Sarlongki Teron Kongkat', role: 'Asst. General Secretary', phone: '+91 69010 29070', color: '#8b5cf6' },
              { no: '05', name: 'Sarmon Lekthe', role: 'Finance Secretary', phone: '+91 81189 28552', color: '#14b8a6' },
              { no: '06', name: 'Bimol Ingti', role: 'Treasurer', phone: '+91 70860 27229', color: '#22c55e' },
              { no: '07', name: 'Jalinson Phangcho', role: 'Manager', phone: '+91 99575 51560', color: '#f97316' },
              { no: '08', name: 'Timothy Tokbi', role: 'Operation Manager', phone: '+91 70860 49705', color: '#06b6d4' },
              { no: '09', name: 'Birlong Kro', role: 'Medical Officer / Physio', phone: '+91 76378 35932', color: '#10b981' },
              { no: '10', name: 'Sarlongki Teron', role: 'IT Officer', phone: '+91 84730 10850', color: '#a78bfa' },
            ].map(({ no, name, role, phone, color }, i) => (
              <motion.div
                key={no}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                whileHover={{ y: -3 }}
                style={{ backgroundColor: 'rgba(10,20,15,0.8)', borderColor: `${color}30`, borderWidth: 1, borderStyle: 'solid' }}
                className="rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{ backgroundColor: `${color}20`, color }}>
                  {no}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: textMain }} className="font-bold text-sm">{name}</p>
                  <p className="text-xs font-semibold" style={{ color }}>{role}</p>
                  <a href={`tel:${phone.replace(/\s/g, '')}`}
                    className="text-xs mt-0.5 hover:opacity-80 transition-opacity"
                    style={{ color: textMute }}>
                    {phone}
                  </a>
                </div>
                <div className="shrink-0 w-1 h-10 rounded-full" style={{ backgroundColor: color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}      <section style={{ backgroundColor: bgMid }} className="py-20 px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl p-8 sm:p-12 text-center"
            style={{ background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #dc2626 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' }} />
            <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10">
              <p className="text-orange-200 font-bold text-xs tracking-[0.3em] uppercase mb-3">Don't Miss Out</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white uppercase mb-4">Ready to Compete?</h2>
              <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
                Registration closes <strong>{TOURNAMENT.deadline}</strong>. Don't miss your chance to compete!
              </p>
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.3)' }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-orange-600 font-black text-lg hover:bg-orange-50 transition-colors shadow-2xl">
                Register Now <ArrowRight className="w-5 h-5" />
              </motion.button>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-orange-200 text-sm">
                {['Free to browse', 'Instant confirmation', 'Secure payment'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{t}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ backgroundColor: '#050a05', borderTopColor: border }} className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SSU" className="w-8 h-8 rounded-full object-cover border border-orange-500/40" />
            <div>
              <p style={{ color: textMain }} className="font-bold text-sm">Shining Star United</p>
              <p style={{ color: textMute }} className="text-xs">© 2025 All rights reserved. Developed by Sarlongki Teron</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            {[['Fixtures', '/fixtures'], ['Leaderboard', '/leaderboard'], ['Live', '/live']].map(([label, path]) => (
              <button key={label} onClick={() => navigate(path)} style={{ color: textMute }} className="hover:text-orange-400 transition-colors">{label}</button>
            ))}
            <a href="/admin/login" style={{ color: textMute }} className="hover:text-orange-400 transition-colors">Admin</a>
          </div>
          {/* Social links */}
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/share/g/17jJ3n6gXt/" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:scale-110"
              style={{ backgroundColor: 'rgba(24,119,242,0.15)', border: '1px solid rgba(24,119,242,0.3)' }}
              title="Facebook">
              <svg className="w-4 h-4" fill="#1877f2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/shiningstarunitedfc_official?igsh=Y2NiYzBiOTh4MmM%3D&utm_source=qr" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:scale-110"
              style={{ backgroundColor: 'rgba(225,48,108,0.15)', border: '1px solid rgba(225,48,108,0.3)' }}
              title="Instagram">
              <svg className="w-4 h-4" fill="url(#ig-gradient)" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433"/>
                    <stop offset="25%" stopColor="#e6683c"/>
                    <stop offset="50%" stopColor="#dc2743"/>
                    <stop offset="75%" stopColor="#cc2366"/>
                    <stop offset="100%" stopColor="#bc1888"/>
                  </linearGradient>
                </defs>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
