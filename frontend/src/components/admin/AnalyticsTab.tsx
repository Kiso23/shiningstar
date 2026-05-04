import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Users, Eye, TrendingUp, Monitor, AlertCircle } from 'lucide-react'
import { getAnalyticsSummary, type AnalyticsSummary } from '../../api/analytics'

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
        <AlertCircle className="w-5 h-5 shrink-0" />
        {error}
      </div>
    )
  }

  const maxVisits = Math.max(...data.last_7_days.map((d) => d.visits), 1)
  const pageIcons: Record<string, string> = {
    home: '🏠', fixtures: '📅', live: '📡', leaderboard: '🏆', register: '📝', other: '🔗',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-white font-bold text-lg">Site Analytics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Eye, label: 'Total Visits', value: data.total_visits, color: 'text-orange-400' },
          { icon: Users, label: 'Unique Visitors', value: data.unique_visitors, color: 'text-blue-400' },
          { icon: TrendingUp, label: "Today's Visits", value: data.today_visits, color: 'text-green-400' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 flex flex-col gap-2"
          >
            <div className={`flex items-center gap-2 ${color}`}>
              <Icon className="w-4 h-4" />
              <span className="text-xs text-gray-400">{label}</span>
            </div>
            <p className={`text-3xl font-black ${color}`}>{value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Last 7 days bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          Last 7 Days
        </h3>
        <div className="flex items-end gap-2 h-32">
          {data.last_7_days.map((day, i) => {
            const height = maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0
            const label = new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{day.visits > 0 ? day.visits : ''}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, day.visits > 0 ? 8 : 2)}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  className="w-full rounded-t-lg bg-orange-500/70 hover:bg-orange-500 transition-colors min-h-[2px]"
                  style={{ height: `${Math.max(height, day.visits > 0 ? 8 : 2)}%` }}
                />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Visits by page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-400" />
          Visits by Page
        </h3>
        {data.by_page.length === 0 ? (
          <p className="text-gray-500 text-sm">No data yet.</p>
        ) : (
          <div className="space-y-3">
            {data.by_page.map((p, i) => {
              const total = data.total_visits || 1
              const pct = Math.round((p.visits / total) * 100)
              return (
                <div key={p.page}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">
                      {pageIcons[p.page] ?? '🔗'} {p.page.charAt(0).toUpperCase() + p.page.slice(1)}
                    </span>
                    <span className="text-sm text-gray-400">{p.visits} <span className="text-gray-600">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-blue-500"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
