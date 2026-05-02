import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react'
import { listRegistrations } from '../../api/admin'
import type { PaginatedTeamList } from '../../api/admin'
import type { TeamResponse } from '../../api/registrations'
import StatusBadge from './StatusBadge'

const STATUSES = ['', 'pending', 'payment_submitted', 'approved', 'rejected']
const STATUS_LABELS: Record<string, string> = {
  '': 'All Statuses',
  pending: 'Pending',
  payment_submitted: 'Payment Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
}

interface Props {
  onSelect: (team: TeamResponse) => void
  selectedId?: string
  refreshKey?: number
}

export default function RegistrationTable({ onSelect, selectedId, refreshKey }: Props) {
  const [data, setData] = useState<PaginatedTeamList | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listRegistrations({
        page,
        page_size: 10,
        status: status || undefined,
        search: debouncedSearch || undefined,
      })
      setData(res)
    } catch {
      // handled silently
    } finally {
      setLoading(false)
    }
  }, [page, status, debouncedSearch, refreshKey])

  useEffect(() => { fetchData() }, [fetchData])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [status, debouncedSearch])

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team or manager..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm pr-8 appearance-none cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-gray-900">
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p>No registrations found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {data.items.map((team, i) => (
                <motion.div
                  key={team.registration_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onSelect(team)}
                  className={`
                    p-4 rounded-xl border cursor-pointer transition-all duration-200
                    ${selectedId === team.registration_id
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{team.team_name}</p>
                      <p className="text-sm text-gray-400 truncate">{team.manager_name}</p>
                      <p className="text-xs text-gray-600 mt-1 font-mono">{team.registration_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge status={team.status} />
                      <span className="text-xs text-gray-600">{team.player_count} players</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <span className="text-xs text-gray-500">
            {data.total} total · Page {data.page} of {data.total_pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page === data.total_pages}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
