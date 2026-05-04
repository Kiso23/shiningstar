import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { getTournamentDate, updateTournamentDate } from '../../api/settings'

export default function SettingsTab() {
  const [dateValue, setDateValue] = useState('')   // datetime-local input value
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTournamentDate()
      .then((d) => {
        // Convert ISO to datetime-local format (YYYY-MM-DDTHH:MM)
        setDateValue(d.tournament_start.slice(0, 16))
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
      )}
    </div>
  )
}
