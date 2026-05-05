import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, CheckCircle, AlertCircle, Settings, Lock, Eye, EyeOff, Type } from 'lucide-react'
import { getTournamentDate, updateTournamentDate, getAllSettings, updateBanner } from '../../api/settings'
import { changePassword } from '../../api/password'

// Reusable password field with eye toggle
function PasswordField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '••••••••'}
        className="input-field pr-10 mt-1"
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

export default function SettingsTab() {
  const [dateValue, setDateValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Change password state
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passSaved, setPassSaved] = useState(false)
  const [passError, setPassError] = useState<string | null>(null)

  // Banner state
  const [bannerLine1, setBannerLine1] = useState('')
  const [bannerLine2, setBannerLine2] = useState('')
  const [bannerSaving, setBannerSaving] = useState(false)
  const [bannerSaved, setBannerSaved] = useState(false)
  const [bannerError, setBannerError] = useState<string | null>(null)

  useEffect(() => {
    getAllSettings()
      .then((s) => {
        setDateValue(s.tournament_start.slice(0, 16))
        setBannerLine1(s.banner_line1)
        setBannerLine2(s.banner_line2)
      })
      .catch(() => setError('Failed to load settings.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!dateValue) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      // Send exactly what the user typed — no UTC conversion
      await updateTournamentDate(dateValue + ':00')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPass.length < 8) { setPassError('New password must be at least 8 characters'); return }
    if (newPass !== confirmPass) { setPassError('Passwords do not match'); return }
    setPassLoading(true); setPassError(null); setPassSaved(false)
    try {
      await changePassword(currentPass, newPass)
      setPassSaved(true)
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
      setTimeout(() => setPassSaved(false), 3000)
    } catch (err: any) {
      setPassError(err?.response?.data?.detail || 'Failed to change password.')
    } finally {
      setPassLoading(false)
    }
  }

  const handleSaveBanner = async () => {
    if (!bannerLine1.trim()) { setBannerError('Line 1 cannot be empty'); return }
    setBannerSaving(true); setBannerError(null); setBannerSaved(false)
    try {
      await updateBanner(bannerLine1.trim(), bannerLine2.trim())
      setBannerSaved(true)
      setTimeout(() => setBannerSaved(false), 3000)
    } catch {
      setBannerError('Failed to save banner.')
    } finally {
      setBannerSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-orange-400" />
        <h2 className="text-white font-bold text-lg">Site Settings</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading settings...
        </div>
      ) : (
        <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-5"
        >
          <div>
            <h3 className="text-white font-semibold mb-1">Countdown Timer</h3>
            <p className="text-gray-500 text-sm mb-4">
              Set the tournament start date and time. The homepage countdown will update immediately for all visitors.
            </p>

            <label className="label">Tournament Start Date &amp; Time</label>
            <input
              type="datetime-local"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="input-field mt-1"
            />

            {dateValue && (
              <p className="text-gray-500 text-xs mt-2">
                Countdown target: <span className="text-orange-400 font-medium">
                  {new Date(dateValue).toLocaleString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long',
                    day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving || !dateValue}
            className="btn-primary w-full"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Settings</>
            )}
          </motion.button>
        </motion.div>

        {/* Banner Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-orange-400" />
            <h3 className="text-white font-semibold">Homepage Banner Text</h3>
          </div>
          <p className="text-gray-500 text-sm">This appears on the hero section of the homepage.</p>

          {/* Live preview */}
          <div className="px-4 py-3 border-l-4 border-orange-500 bg-orange-500/10 rounded-r-xl">
            <p className="text-white font-bold text-sm">{bannerLine1 || 'Line 1'}</p>
            <p className="text-orange-400 font-semibold text-xs">{bannerLine2 || 'Line 2'}</p>
          </div>

          <div>
            <label className="label">Line 1 (main text)</label>
            <input
              type="text"
              value={bannerLine1}
              onChange={(e) => setBannerLine1(e.target.value)}
              placeholder="e.g. Shining Star United FC"
              className="input-field mt-1"
              maxLength={80}
            />
          </div>
          <div>
            <label className="label">Line 2 (subtitle)</label>
            <input
              type="text"
              value={bannerLine2}
              onChange={(e) => setBannerLine2(e.target.value)}
              placeholder="e.g. Football Tournament"
              className="input-field mt-1"
              maxLength={80}
            />
          </div>

          {bannerError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{bannerError}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveBanner}
            disabled={bannerSaving || !bannerLine1.trim()}
            className="btn-primary w-full"
          >
            {bannerSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : bannerSaved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
              : <><Save className="w-4 h-4" /> Save Banner</>}
          </motion.button>
        </motion.div>

        {/* Change Password */}        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-400" />
            <h3 className="text-white font-semibold">Change Password</h3>
          </div>
          <div>
            <label className="label">Current Password</label>
            <PasswordField value={currentPass} onChange={setCurrentPass} placeholder="Current password" />
          </div>
          <div>
            <label className="label">New Password</label>
            <PasswordField value={newPass} onChange={setNewPass} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <PasswordField value={confirmPass} onChange={setConfirmPass} placeholder="Repeat new password" />
          </div>
          {passError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{passError}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleChangePassword}
            disabled={passLoading || !currentPass || !newPass || !confirmPass}
            className="btn-primary w-full"
          >
            {passLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</>
              : passSaved ? <><CheckCircle className="w-4 h-4" /> Password Changed!</>
              : <><Lock className="w-4 h-4" /> Change Password</>}
          </motion.button>
        </motion.div>
        </>
      )}
    </div>
  )
}
