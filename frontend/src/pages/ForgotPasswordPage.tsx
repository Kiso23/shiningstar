import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, KeyRound, Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { forgotPassword, verifyOTP, resetPassword } from '../api/password'

type Step = 'email' | 'otp' | 'newpass' | 'done'

// Reusable password input with eye toggle
function PasswordInput({
  value, onChange, placeholder, onKeyDown,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '••••••••'}
        className="input-field pr-10"
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOTP = async () => {
    if (!email) return
    setLoading(true); setError(null)
    try {
      await forgotPassword(email)
      setStep('otp')
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally { setLoading(false) }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true); setError(null)
    try {
      await verifyOTP(email, otp)
      setStep('newpass')
    } catch {
      setError('Invalid or expired OTP. Please try again.')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async () => {
    if (newPass.length < 8) { setError('Password must be at least 8 characters'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return }
    setLoading(true); setError(null)
    try {
      await resetPassword(email, otp, newPass)
      setStep('done')
    } catch {
      setError('Failed to reset password. OTP may have expired.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="SSU" className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/40 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Portal · Shining Star United</p>
        </div>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">

            {/* Step 1: Email */}
            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-2 text-orange-400">
                  <Mail className="w-5 h-5" />
                  <p className="font-semibold text-sm">Enter your admin email</p>
                </div>
                <p className="text-gray-500 text-sm">We'll send a 6-digit OTP to your registered email address.</p>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="input-field"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                  />
                </div>
                {error && <p className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</p>}
                <button onClick={handleSendOTP} disabled={loading || !email} className="btn-primary w-full">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : 'Send OTP'}
                </button>
              </motion.div>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-2 text-orange-400">
                  <KeyRound className="w-5 h-5" />
                  <p className="font-semibold text-sm">Enter OTP</p>
                </div>
                <p className="text-gray-500 text-sm">
                  A 6-digit code was sent to <span className="text-orange-400">{email}</span>. Expires in 10 minutes.
                </p>
                <div>
                  <label className="label">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="1 2 3 4 5 6"
                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                  />
                </div>
                {error && <p className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</p>}
                <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className="btn-primary w-full">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : 'Verify OTP'}
                </button>
                <button onClick={() => { setStep('email'); setOtp(''); setError(null) }} className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors">
                  ← Use different email
                </button>
              </motion.div>
            )}

            {/* Step 3: New password */}
            {step === 'newpass' && (
              <motion.div key="newpass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-2 text-orange-400">
                  <Lock className="w-5 h-5" />
                  <p className="font-semibold text-sm">Set new password</p>
                </div>
                <div>
                  <label className="label">New Password</label>
                  <PasswordInput value={newPass} onChange={setNewPass} placeholder="Min. 8 characters" />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <PasswordInput
                    value={confirmPass}
                    onChange={setConfirmPass}
                    placeholder="Repeat password"
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                  />
                </div>
                {error && <p className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</p>}
                <button onClick={handleResetPassword} disabled={loading} className="btn-primary w-full">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting...</> : 'Reset Password'}
                </button>
              </motion.div>
            )}

            {/* Step 4: Done */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <h3 className="text-white font-bold text-xl">Password Reset!</h3>
                <p className="text-gray-400 text-sm">Your password has been updated successfully.</p>
                <button onClick={() => navigate('/admin/login')} className="btn-primary w-full">
                  Sign In Now
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Back to sign in — prominent */}
        {step !== 'done' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/login')}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-orange-500/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
