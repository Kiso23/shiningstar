import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, CheckCircle, AlertCircle, Settings, Lock, Eye, EyeOff, Type, Trash2 } from 'lucide-react'
import { getTournamentDate, updateTournamentDate, getAllSettings, updateBanner, updateHero, resetLeaderboardAndScorers } from '../../api/settings'
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
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors"
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

  // Hero title state
  const [heroLine1, setHeroLine1] = useState('')
  const [heroLine2, setHeroLine2] = useState('')
  const [heroLine3, setHeroLine3] = useState('')
  const [heroSaving, setHeroSaving] = useState(false)
  const [heroSaved, setHeroSaved] = useState(false)
  const [heroError, setHeroError] = useState<string | null>(null)

  // Reset state
  const [resetLoading, setResetLoading] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  useEffect(() => {
    getAllSettings()
      .then((s) => {
        setDateValue(s.tournament_start.slice(0, 16))
        setBannerLine1(s.banner_line1)
        setBannerLine2(s.banner_line2)
        setHeroLine1(s.hero_line1 || 'Shining')
        setHeroLine2(s.hero_line2 || 'Star')
        setHeroLine3(s.hero_line3 || 'United FC')
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
      // Refresh the page to show updated settings
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      console.error('Error saving tournament date:', err)
      setError(err?.response?.data?.detail || 'Failed to save. Please try again.')
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
      // Refresh the page to show updated settings
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      console.error('Error saving banner:', err)
      setBannerError(err?.response?.data?.detail || 'Failed to save banner.')
    } finally {
      setBannerSaving(false)
    }
  }

  const handleSaveHero = async () => {
    if (!heroLine1.trim()) { setHeroError('Line 1 cannot be empty'); return }
    setHeroSaving(true); setHeroError(null); setHeroSaved(false)
    try {
      await updateHero(heroLine1.trim(), heroLine2.trim(), heroLine3.trim())
      setHeroSaved(true)
      // Refresh the page to show updated settings
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      console.error('Error saving hero:', err)
      setHeroError(err?.response?.data?.detail || 'Failed to save hero title.')
    } finally {
      setHeroSaving(false)
    }
  }

  const handleResetStats = async () => {
    setResetLoading(true)
    setResetError(null)
    setResetMessage(null)
    try {
      const result = await resetLeaderboardAndScorers()
      setResetMessage(result.message)
      setResetConfirm(false)
      // Refresh after a short delay so user sees the success message
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      console.error('Error resetting stats:', err)
      setResetError(err?.response?.data?.detail || 'Failed to reset leaderboard and scores.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-green-400" />
        <h2 className="text-white font-bold text-lg">Site Settings</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading settings...
        </div>
      ) : (
        <>
        <div
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
              autoComplete="off"
            />

            {dateValue && (
              <p className="text-gray-500 text-xs mt-2">
                Countdown target: <span className="text-green-400 font-medium">
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

          <button
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
          </button>
        </div>

        {/* Hero Title */}
        <div
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-green-400" />
            <h3 className="text-white font-semibold">Hero Title (Big Text)</h3>
          </div>
          <p className="text-gray-500 text-sm">The large title on the homepage hero section.</p>

          {/* Live preview */}
          <div className="p-4 rounded-xl bg-black/30 text-center">
            <p className="text-white font-black text-2xl uppercase leading-tight">
              {heroLine1 || 'Line 1'}<br />
              {heroLine2 || 'Line 2'}<br />
              <span className="text-green-500">{heroLine3 || 'Line 3'}</span>
            </p>
          </div>

          <div>
            <label className="label">Line 1 (white)</label>
            <input 
              type="text" 
              value={heroLine1} 
              onChange={(e) => setHeroLine1(e.target.value)}
              placeholder="e.g. Shining" 
              className="input-field mt-1" 
              maxLength={30}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="label">Line 2 (white)</label>
            <input 
              type="text" 
              value={heroLine2} 
              onChange={(e) => setHeroLine2(e.target.value)}
              placeholder="e.g. Star" 
              className="input-field mt-1" 
              maxLength={30}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="label">Line 3 (green)</label>
            <input 
              type="text" 
              value={heroLine3} 
              onChange={(e) => setHeroLine3(e.target.value)}
              placeholder="e.g. United FC" 
              className="input-field mt-1" 
              maxLength={30}
              autoComplete="off"
            />
          </div>

          {heroError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{heroError}
            </div>
          )}
          <button
            onClick={handleSaveHero} 
            disabled={heroSaving || !heroLine1.trim()}
            className="btn-primary w-full">
            {heroSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : heroSaved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
              : <><Save className="w-4 h-4" /> Save Hero Title</>}
          </button>
        </div>

        {/* Banner Text */}
        <div
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-green-400" />
            <h3 className="text-white font-semibold">Homepage Banner Text</h3>
          </div>
          <p className="text-gray-500 text-sm">This appears on the hero section of the homepage.</p>

          {/* Live preview */}
          <div className="px-4 py-3 border-l-4 border-green-500 bg-green-500/10 rounded-r-xl">
            <p className="text-white font-bold text-sm">{bannerLine1 || 'Line 1'}</p>
            <p className="text-green-400 font-semibold text-xs">{bannerLine2 || 'Line 2'}</p>
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
              autoComplete="off"
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
              autoComplete="off"
            />
          </div>

          {bannerError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{bannerError}
            </div>
          )}
          <button
            onClick={handleSaveBanner}
            disabled={bannerSaving || !bannerLine1.trim()}
            className="btn-primary w-full"
          >
            {bannerSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : bannerSaved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
              : <><Save className="w-4 h-4" /> Save Banner</>}
          </button>
        </div>

        {/* Change Password */}        <div
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-400" />
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
          <button
            onClick={handleChangePassword}
            disabled={passLoading || !currentPass || !newPass || !confirmPass}
            className="btn-primary w-full"
          >
            {passLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</>
              : passSaved ? <><CheckCircle className="w-4 h-4" /> Password Changed!</>
              : <><Lock className="w-4 h-4" /> Change Password</>}
          </button>
        </div>

        {/* Reset Leaderboard & Top Scorers */}
        <div className="glass-card p-6 space-y-4 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-400" />
            <h3 className="text-white font-semibold">Reset Statistics</h3>
          </div>
          <p className="text-gray-500 text-sm">
            Clear all match events (goals, cards), player performances, and leaderboard entries. This action cannot be undone.
          </p>

          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              className="w-full py-2 px-4 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Reset Leaderboard & Top Scorers
            </button>
          ) : (
            <div className="space-y-3 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
              <p className="text-red-300 font-semibold">Are you sure? This will delete:</p>
              <ul className="text-red-300 text-sm space-y-1 ml-4">
                <li>• All match events (goals, yellow cards, red cards)</li>
                <li>• All player performances and statistics</li>
                <li>• All leaderboard standings</li>
              </ul>
              <p className="text-red-400 text-sm font-semibold mt-3">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-lg bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 hover:text-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetStats}
                  disabled={resetLoading}
                  className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Yes, Reset</>
                  )}
                </button>
              </div>
            </div>
          )}

          {resetMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              {resetMessage}
            </motion.div>
          )}

          {resetError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{resetError}
            </div>
          )}
        </div>
        </>
      )}
    </div>
  )
}
