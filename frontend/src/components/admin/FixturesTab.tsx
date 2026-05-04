import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Calendar, MapPin } from 'lucide-react'
import { getMatches, deleteMatch, type MatchResponse } from '../../api/matches'
import { listRegistrations } from '../../api/admin'
import { extractErrorMessage } from '../../api/errors'
import FixtureForm, { type TeamOption } from './FixtureForm'

export default function FixturesTab() {
  const [matches, setMatches] = useState<MatchResponse[]>([])
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingFixture, setEditingFixture] = useState<MatchResponse | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<MatchResponse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [matchData, teamData] = await Promise.all([
        getMatches(),
        listRegistrations({ status: 'approved', page_size: 100 }),
      ])
      setMatches(matchData)
      setTeams(
        teamData.items.map((t) => ({
          id: (t as any).id ?? t.registration_id,
          team_name: t.team_name,
        }))
      )
    } catch {
      setError('Failed to load fixtures.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSaved = () => {
    setShowForm(false)
    setEditingFixture(undefined)
    fetchData()
  }

  const handleEdit = (fixture: MatchResponse) => {
    setEditingFixture(fixture)
    setShowForm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteMatch(deleteTarget.id)
      setDeleteTarget(null)
      fetchData()
    } catch (err: any) {
      setDeleteError(extractErrorMessage(err, 'Failed to delete fixture.'))
    } finally {
      setDeleting(false)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'live') return 'text-green-400 bg-green-500/10 border-green-500/20'
    if (status === 'completed') return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Fixtures</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingFixture(undefined); setShowForm(true) }}
          className="btn-primary py-2 px-4 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Fixture
        </motion.button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Calendar className="w-10 h-10 mb-3 opacity-30" />
          <p>No fixtures yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Round</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Teams</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Date/Time</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Venue</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, idx) => (
                  <motion.tr
                    key={match.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{match.round}</td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{match.team_a_name}</span>
                      <span className="text-gray-600 mx-2">vs</span>
                      <span className="text-white font-medium">{match.team_b_name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-600" />
                        {new Date(match.scheduled_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short',
                        })}{' '}
                        {new Date(match.scheduled_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                        <span className="truncate max-w-[140px]">{match.venue}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColor(match.status)}`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(match)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Edit fixture"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(match)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete fixture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fixture Form Modal */}
      {showForm && (
        <FixtureForm
          fixture={editingFixture}
          teams={teams}
          onClose={() => { setShowForm(false); setEditingFixture(undefined) }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-sm p-6 space-y-4"
            >
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Delete fixture?</p>
                  <p className="text-sm text-red-400/80 mt-1">
                    {deleteTarget.team_a_name} vs {deleteTarget.team_b_name} ({deleteTarget.round}) will be permanently removed.
                  </p>
                </div>
              </div>
              {deleteError && (
                <p className="text-red-400 text-sm">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                  disabled={deleting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="btn-danger flex-1"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
