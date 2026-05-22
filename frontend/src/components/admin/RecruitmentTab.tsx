import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, User, MapPin, Trophy, Send, Loader2, AlertCircle, CheckCircle, X, Clock, Eye, Trash2 } from 'lucide-react'
import { listPlayerRecruitments, getPlayerRecruitment, updatePlayerRecruitmentStatus, deletePlayerRecruitment, type PlayerRecruitmentResponse, type PlayerRecruitmentList } from '../../api/player_recruitment'

export default function RecruitmentTab() {
  const [recruitments, setRecruitments] = useState<PlayerRecruitmentList[]>([])
  const [selectedRecruitment, setSelectedRecruitment] = useState<PlayerRecruitmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load recruitments
  useEffect(() => {
    loadRecruitments()
  }, [statusFilter])

  const loadRecruitments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listPlayerRecruitments(0, 100, statusFilter || undefined)
      setRecruitments(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRecruitment = async (recruitment: PlayerRecruitmentList) => {
    try {
      const fullRecruitment = await getPlayerRecruitment(recruitment.id)
      setSelectedRecruitment(fullRecruitment)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load application details')
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedRecruitment) return

    try {
      setStatusLoading(true)
      setError(null)
      
      const updated = await updatePlayerRecruitmentStatus(selectedRecruitment.id, {
        status: newStatus as any,
        admin_notes: selectedRecruitment.admin_notes,
      })
      
      setSelectedRecruitment(updated)
      setSuccessMessage(`Application marked as ${newStatus}!`)
      
      // Reload recruitments list
      await loadRecruitments()
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async (recruitmentId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      setError(null)
      await deletePlayerRecruitment(recruitmentId)
      setSelectedRecruitment(null)
      await loadRecruitments()
      setSuccessMessage('Application deleted successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete application')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'reviewed':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'shortlisted':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'reviewed':
        return <Eye className="w-4 h-4" />
      case 'shortlisted':
        return <Trophy className="w-4 h-4" />
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <X className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full gap-6">
      {/* Left panel - Recruitments list */}
      <div className="w-full lg:w-96 flex flex-col border-r border-white/5">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-white font-bold mb-4">Player Applications</h2>
          
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status === 'all' ? null : status)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  (status === 'all' && !statusFilter) || statusFilter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Success message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            {successMessage}
          </motion.div>
        )}

        {/* Recruitments list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : recruitments.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              No applications found
            </div>
          ) : (
            recruitments.map((recruitment) => (
              <motion.button
                key={recruitment.id}
                onClick={() => handleSelectRecruitment(recruitment)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedRecruitment?.id === recruitment.id
                    ? 'bg-orange-500/20 border border-orange-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{recruitment.full_name}</p>
                    <p className="text-gray-500 text-xs truncate">{recruitment.position}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 shrink-0 ${getStatusColor(recruitment.status)}`}>
                    {getStatusIcon(recruitment.status)}
                    {recruitment.status}
                  </div>
                </div>
                <p className="text-gray-400 text-xs truncate">{recruitment.email}</p>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Right panel - Recruitment details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedRecruitment ? (
            <motion.div
              key={selectedRecruitment.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Header */}
              <div className="mb-6 pb-4 border-b border-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{selectedRecruitment.full_name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{selectedRecruitment.position.toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium border flex items-center gap-2 ${getStatusColor(selectedRecruitment.status)}`}>
                      {getStatusIcon(selectedRecruitment.status)}
                      {selectedRecruitment.status}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(selectedRecruitment.id)}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete this application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span className="truncate">{selectedRecruitment.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span>{selectedRecruitment.phone}</span>
                  </div>
                </div>
              </div>

              {/* Photo */}
              {selectedRecruitment.photo_url && (
                <div className="mb-6 pb-4 border-b border-white/5">
                  <p className="text-gray-500 text-xs mb-2">Player Photo</p>
                  <div className="relative">
                    <img 
                      src={selectedRecruitment.photo_url} 
                      alt={selectedRecruitment.full_name} 
                      className="w-32 h-32 rounded-lg object-cover border border-orange-500/30"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        // Try alternative path if primary fails
                        if (!img.dataset.retried) {
                          img.dataset.retried = 'true'
                          const altPath = selectedRecruitment.photo_url?.replace('/uploads/', '/static/uploads/')
                          if (altPath && altPath !== selectedRecruitment.photo_url) {
                            img.src = altPath
                            return
                          }
                        }
                        // Fallback to placeholder
                        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" fill="%23666" text-anchor="middle" dy=".3em"%3E%3F%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2 break-all">{selectedRecruitment.photo_url}</p>
                </div>
              )}

              {/* Details */}
              <div className="mb-6 pb-4 border-b border-white/5 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Age</p>
                    <p className="text-white font-semibold">{selectedRecruitment.age} years</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Experience</p>
                    <p className="text-white font-semibold">{selectedRecruitment.years_of_experience} years</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Height</p>
                    <p className="text-white font-semibold">{selectedRecruitment.height ? `${selectedRecruitment.height} cm` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Weight</p>
                    <p className="text-white font-semibold">{selectedRecruitment.weight ? `${selectedRecruitment.weight} kg` : 'N/A'}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-gray-500 text-xs mb-1">Address</p>
                  <p className="text-white text-sm">{selectedRecruitment.address}</p>
                  <p className="text-gray-400 text-sm">{selectedRecruitment.city}, {selectedRecruitment.state} {selectedRecruitment.postal_code}</p>
                </div>

                {/* Previous Clubs */}
                {selectedRecruitment.previous_clubs && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-500 text-xs mb-1">Previous Clubs</p>
                    <p className="text-white text-sm whitespace-pre-wrap">{selectedRecruitment.previous_clubs}</p>
                  </div>
                )}

                {/* Achievements */}
                {selectedRecruitment.achievements && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-500 text-xs mb-1">Achievements</p>
                    <p className="text-white text-sm whitespace-pre-wrap">{selectedRecruitment.achievements}</p>
                  </div>
                )}

                {/* Injuries */}
                {selectedRecruitment.injuries_or_concerns && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-500 text-xs mb-1">Health Concerns</p>
                    <p className="text-white text-sm whitespace-pre-wrap">{selectedRecruitment.injuries_or_concerns}</p>
                  </div>
                )}

                {/* Additional Notes */}
                {selectedRecruitment.additional_notes && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-500 text-xs mb-1">Additional Notes</p>
                    <p className="text-white text-sm whitespace-pre-wrap">{selectedRecruitment.additional_notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                {selectedRecruitment.status !== 'accepted' && selectedRecruitment.status !== 'rejected' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdateStatus('reviewed')}
                      disabled={statusLoading}
                      className="flex-1 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
                    >
                      {statusLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Mark Reviewed'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdateStatus('shortlisted')}
                      disabled={statusLoading}
                      className="flex-1 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                    >
                      {statusLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Shortlist'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdateStatus('accepted')}
                      disabled={statusLoading}
                      className="flex-1 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-semibold hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Accept</>}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdateStatus('rejected')}
                      disabled={statusLoading}
                      className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {statusLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Reject'}
                    </motion.button>
                  </>
                )}

                {(selectedRecruitment.status === 'accepted' || selectedRecruitment.status === 'rejected') && (
                  <div className="flex-1 py-2 rounded-lg bg-gray-500/10 border border-gray-500/20 text-gray-400 font-semibold text-center">
                    Status: {selectedRecruitment.status.toUpperCase()}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-gray-600"
            >
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Select an application</p>
                <p className="text-sm mt-1">Click any player from the list to view details and take action</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
