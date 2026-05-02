import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  Trophy, Calendar, MapPin, Users, Star, ChevronRight,
  Shield, Zap, Award, ArrowRight, CheckCircle
} from 'lucide-react'

const TOURNAMENT = {
  name: 'Shining Star United',
  edition: '2025 Championship',
  date: 'June 15–22, 2025',
  venue: 'Rongbong Ronghang Playground',
  prize: '₹8,000',
  runnerUp: '₹4,000',
  thirdPlace: '₹2,000',
  registrationFee: '₹801 per team',
  maxTeams: 32,
  deadline: 'May 31, 2025',
}

const FEATURES = [
  { icon: Shield, title: 'Secure Registration', desc: 'Your data is protected with enterprise-grade security.' },
  { icon: Zap, title: 'Instant Confirmation', desc: 'Get your registration ID immediately after submission.' },
  { icon: Award, title: 'Prestigious Tournament', desc: 'Compete against the best teams in the region.' },
]

const PRIZES = [
  { place: '🥇 Champion', amount: '₹8,000', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30' },
  { place: '🥈 Runner-Up', amount: '₹4,000', color: 'from-gray-400/20 to-gray-500/10 border-gray-400/30' },
  { place: '🥉 Third Place', amount: '₹2,000', color: 'from-orange-700/20 to-orange-800/10 border-orange-700/30' },
]

const STEPS = [
  { n: '01', title: 'Register Team', desc: 'Fill in your team and manager details.' },
  { n: '02', title: 'Add Players', desc: 'Submit your complete player roster.' },
  { n: '03', title: 'Pay & Submit', desc: 'Complete UPI payment and upload proof.' },
  { n: '04', title: 'Get Approved', desc: 'Admin verifies and confirms your spot.' },
]

// Floating particle component
function Particle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-orange-400/30"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
}))

export default function HomePage() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">
      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4
                   bg-gray-950/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Shining Star United Hamren"
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/40"
          />
          <span className="font-bold text-white">Shining Star United</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/register')}
          className="btn-primary text-sm py-2 px-4"
        >
          Register Now
        </motion.button>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-radial from-orange-500/10 via-transparent to-transparent" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-green-500/10 blur-3xl"
        />

        {/* Particles */}
        {particles.map((p, i) => (
          <Particle key={i} x={p.x} y={p.y} delay={p.delay} />
        ))}

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20"
        >
          {/* Prominent Banner Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="relative px-8 py-6 rounded-3xl bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 bg-[length:200%_100%] shadow-2xl shadow-orange-500/50"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-3xl sm:text-5xl md:text-6xl font-black text-white text-center tracking-tight leading-tight drop-shadow-2xl"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(249,115,22,0.6)' }}
              >
                KARDOM LAPEN KURVANGTHU
                <br />
                ANGTON APHAN TA
              </motion.div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400/20 via-yellow-400/20 to-orange-400/20 blur-xl -z-10" />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-8"
          >
            <Star className="w-3.5 h-3.5" fill="currentColor" />
            2025 Championship Edition
            <Star className="w-3.5 h-3.5" fill="currentColor" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-7xl font-black text-white leading-tight mb-6"
          >
            <span className="gradient-text">Shining Star</span>
            <br />
            <span className="text-white">United</span>
            <br />
            <span className="text-3xl sm:text-4xl font-bold text-gray-400">Football Tournament</span>
          </motion.h1>

          {/* Info pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-10"
          >
            {[
              { icon: Calendar, text: TOURNAMENT.date },
              { icon: MapPin, text: TOURNAMENT.venue },
              { icon: Trophy, text: `Prize: ${TOURNAMENT.prize}` },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm">
                <Icon className="w-4 h-4 text-orange-400" />
                {text}
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(249,115,22,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="btn-primary text-lg px-8 py-4 rounded-2xl"
            >
              Register Your Team
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary text-lg px-8 py-4 rounded-2xl"
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-gray-600 uppercase tracking-widest">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5"
            >
              <div className="w-1 h-2 rounded-full bg-orange-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Tournament Details ── */}
      <section id="details" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Tournament Details</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to know about the biggest football tournament of the year.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Calendar, label: 'Tournament Dates', value: TOURNAMENT.date, color: 'text-blue-400' },
              { icon: MapPin, label: 'Venue', value: TOURNAMENT.venue, color: 'text-green-400' },
              { icon: Users, label: 'Max Teams', value: `${TOURNAMENT.maxTeams} Teams`, color: 'text-purple-400' },
              { icon: Trophy, label: 'Registration Fee', value: TOURNAMENT.registrationFee, color: 'text-orange-400' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card p-6 text-center"
              >
                <div className={`inline-flex p-3 rounded-xl bg-white/5 mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-gray-500 text-sm mb-1">{label}</p>
                <p className="text-white font-semibold">{value}</p>
              </motion.div>
            ))}
          </div>

          {/* Prize Pool */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-white text-center mb-8">Prize Pool</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {PRIZES.map(({ place, amount, color }, i) => (
                <motion.div
                  key={place}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ scale: 1.05 }}
                  className={`p-6 rounded-2xl bg-gradient-to-br border text-center ${color}`}
                >
                  <p className="text-2xl mb-2">{place.split(' ')[0]}</p>
                  <p className="text-white font-semibold mb-1">{place.split(' ').slice(1).join(' ')}</p>
                  <p className="text-3xl font-black gradient-text">{amount}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">How to Register</h2>
            <p className="text-gray-400 text-lg">Simple 4-step process to get your team in the tournament.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="glass-card p-6 h-full">
                  <div className="text-5xl font-black gradient-text mb-4 opacity-40">{n}</div>
                  <h3 className="text-white font-bold mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ChevronRight className="w-6 h-6 text-orange-500/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="glass-card p-8 text-center group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex p-4 rounded-2xl bg-orange-500/10 text-orange-400 mb-6 group-hover:bg-orange-500/20 transition-colors"
                >
                  <Icon className="w-7 h-7" />
                </motion.div>
                <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-orange-800 p-12 text-center"
          >
            <div className="absolute inset-0 bg-hero-pattern opacity-20" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative z-10">
              <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-6" />
              <h2 className="text-4xl font-black text-white mb-4">Ready to Compete?</h2>
              <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
                Registration closes on <strong>{TOURNAMENT.deadline}</strong>. Don't miss your chance to win{' '}
                <strong>{TOURNAMENT.prize}</strong>!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-orange-600 font-bold text-lg hover:bg-orange-50 transition-colors shadow-xl"
                >
                  Register Now
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-orange-200 text-sm">
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

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="Shining Star United" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-white font-semibold">Shining Star United</span>
        </div>
        <p>© 2025 Shining Star United. All rights reserved.</p>
        <p className="mt-1">
          Admin?{' '}
          <a href="/admin/login" className="text-orange-400 hover:text-orange-300 transition-colors">
            Sign in here
          </a>
        </p>
      </footer>
    </div>
  )
}
