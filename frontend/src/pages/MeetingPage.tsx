import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { trackVisit } from '../api/analytics'
import { Video, VideoOff, ArrowLeft, Copy, Check } from 'lucide-react'

const MEETING_LINK = 'https://meet.google.com/pxa-oidm-fqk'

export default function MeetingPage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  // Color variables matching HomePage
  const bg = '#080c08'
  const bgMid = '#0e1a0e'
  const bgCard = 'rgba(17,31,17,0.85)'
  const border = 'rgba(255,255,255,0.06)'
  const textMain = '#f0f4f0'
  const textMute = '#6b7a6b'

  useEffect(() => {
    trackVisit('meeting')
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(MEETING_LINK)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const joinMeeting = () => {
    window.open(MEETING_LINK, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ backgroundColor: bg }} className="min-h-screen overflow-x-hidden text-white pt-20">
      {/* ══ HEADER ══ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 mb-12"
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
            <Video className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h1 style={{ color: textMain }} className="text-4xl sm:text-5xl font-black uppercase">
              Live Meeting
            </h1>
            <p style={{ color: textMute }} className="text-sm mt-2">
              Join us for live coaching, discussions, and team meetings
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══ MAIN CONTENT ══ */}
      <section style={{ backgroundColor: bgMid }} className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Meeting Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: bgCard, borderColor: border }}
            className="border rounded-3xl overflow-hidden mb-12"
          >
            {/* Video Preview */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center"
                >
                  <Video className="w-12 h-12 text-green-400" />
                </motion.div>
              </div>
              {/* Animated background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-40 h-40 border border-green-500/20 rounded-full"></div>
                <div className="absolute w-56 h-56 border border-green-500/10 rounded-full"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 style={{ color: textMain }} className="text-2xl font-black mb-2">
                  Ready to Connect?
                </h2>
                <p style={{ color: textMute }} className="text-sm">
                  Click the button below to join the Google Meet session. You can use this link to:
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Join live coaching sessions',
                  'Participate in team discussions',
                  'Ask questions and get instant feedback',
                  'Connect with fellow players and staff',
                  'Share screen for presentations',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
                    <span style={{ color: textMute }} className="text-sm">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Copy Link */}
              <div
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }}
                className="border rounded-xl p-4 mb-6"
              >
                <p style={{ color: textMute }} className="text-xs uppercase tracking-wide mb-2">
                  Meeting Link
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={MEETING_LINK}
                    readOnly
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: border, color: textMain }}
                    className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono pointer-events-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-semibold text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-semibold text-green-400">Copy</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Join Button */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34,197,94,0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={joinMeeting}
                className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl transition-colors text-lg"
              >
                <Video className="w-6 h-6" />
                Join Google Meet Now
              </motion.button>
            </div>
          </motion.div>

          {/* Requirements Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ backgroundColor: bgCard, borderColor: border }}
            className="border rounded-2xl p-6 sm:p-8"
          >
            <h3 style={{ color: textMain }} className="text-xl font-black mb-4 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-green-500"></div>
              What You Need
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Webcam', desc: 'Optional - you can join with audio only' },
                { title: 'Microphone', desc: 'To participate in discussions' },
                { title: 'Internet', desc: 'Good connection for smooth video' },
                { title: 'Browser', desc: 'Chrome, Safari, Firefox, or Edge' },
              ].map(({ title, desc }, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  <div>
                    <p style={{ color: textMain }} className="text-sm font-bold">
                      {title}
                    </p>
                    <p style={{ color: textMute }} className="text-xs">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }}
            className="border rounded-2xl p-6 mt-8 text-center"
          >
            <p style={{ color: textMain }} className="text-sm font-semibold mb-2">
              ⏰ Check the schedule for meeting times
            </p>
            <p style={{ color: textMute }} className="text-xs">
              Meetings are typically held on weekends at 10:00 AM IST. Check our social media or contact us for the latest schedule.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
