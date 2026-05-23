import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2, CheckCircle, XCircle, User, Phone, Mail,
  Users, Calendar, Image, AlertCircle, ChevronDown, ChevronUp, Trash2, Download, MapPin, Bell
} from 'lucide-react'
import { getRegistrationDetail, updateStatus, deleteRegistration, sendRegistrationReminder } from '../../api/admin'
import type { TeamDetail } from '../../api/admin'
import { extractErrorMessage } from '../../api/errors'
import StatusBadge from './StatusBadge'
import client from '../../api/client'
import { jsPDF } from 'jspdf'

interface Props {
  registrationId: string
  onStatusChange: () => void
  onDelete?: () => void
}

export default function RegistrationDetail({ registrationId, onStatusChange, onDelete }: Props) {
  const [detail, setDetail] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [reminderLoading, setReminderLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPlayers, setShowPlayers] = useState(false)
  const [proofBlobUrl, setProofBlobUrl] = useState<string | null>(null)
  const [proofError, setProofError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setProofError(false)
    // Revoke previous blob URL to avoid memory leaks
    if (proofBlobUrl) {
      URL.revokeObjectURL(proofBlobUrl)
      setProofBlobUrl(null)
    }
    getRegistrationDetail(registrationId)
      .then(setDetail)
      .catch(() => setError('Failed to load registration details.'))
      .finally(() => setLoading(false))
  }, [registrationId])

  // Fetch payment proof image with JWT auth once detail is loaded
  useEffect(() => {
    if (!detail?.payment_proof) return
    client
      .get(`/admin/registrations/${registrationId}/payment-proof`, {
        responseType: 'blob',
      })
      .then((res) => {
        const url = URL.createObjectURL(res.data)
        setProofBlobUrl(url)
      })
      .catch(() => setProofError(true))

    return () => {
      // Cleanup blob URL on unmount
      setProofBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [detail?.payment_proof, registrationId])

  const handleAction = async (newStatus: 'approved' | 'rejected') => {
    if (!detail) return
    setActionLoading(newStatus)
    setError(null)
    try {
      const updated = await updateStatus(registrationId, newStatus)
      setDetail((d) => d ? { ...d, status: updated.status } : d)
      onStatusChange()
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Action failed.'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!detail) return
    setDeleteLoading(true)
    setError(null)
    try {
      await deleteRegistration(registrationId)
      onDelete?.()
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to delete registration.'))
      setShowDeleteConfirm(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSendReminder = async () => {
    if (!detail) return
    setReminderLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await sendRegistrationReminder(registrationId)
      setSuccessMessage('Reminder email sent successfully to the team manager!')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to send reminder email.'))
    } finally {
      setReminderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-2">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error || 'Registration not found'}</p>
      </div>
    )
  }

  // Show action buttons for any non-terminal status
  const isTerminal = detail.status === 'approved' || detail.status === 'rejected'
  const canApprove = detail.status === 'payment_submitted'
  const canReject = detail.status === 'pending' || detail.status === 'payment_submitted'

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = 20

    // ── Header ──
    doc.setFillColor(249, 115, 22) // orange
    doc.rect(0, 0, pageW, 18, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('SHINING STAR UNITED FC', pageW / 2, 11, { align: 'center' })

    doc.setFillColor(30, 30, 30)
    doc.rect(0, 18, pageW, 8, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Team Registration Details', pageW / 2, 23.5, { align: 'center' })

    y = 36

    // ── Team name + ID ──
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(detail.team_name, margin, y)
    y += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(`Registration ID: ${detail.registration_id}`, margin, y)
    doc.text(`Status: ${detail.status.toUpperCase()}`, pageW - margin, y, { align: 'right' })
    y += 10

    // ── Divider ──
    doc.setDrawColor(249, 115, 22)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 8

    // ── Team Info ──
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text('Team Information', margin, y)
    y += 7

    const info = [
      ['Manager Name', detail.manager_name],
      ['Contact Phone', detail.contact_phone],
      ['Contact Email', detail.contact_email],
      ['Number of Players', String(detail.player_count)],
      ['Registration Date', new Date(detail.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
    ]

    doc.setFontSize(10)
    info.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(80, 80, 80)
      doc.text(`${label}:`, margin, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 30)
      doc.text(value, margin + 45, y)
      y += 7
    })

    y += 5

    // ── Players ──
    if (detail.players.length > 0) {
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, y, pageW - margin, y)
      y += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(`Player Roster (${detail.players.length} players)`, margin, y)
      y += 8

      // Table header
      doc.setFillColor(249, 115, 22)
      doc.rect(margin, y - 5, pageW - margin * 2, 7, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('#', margin + 2, y)
      doc.text('Player Name', margin + 12, y)
      doc.text('Age', margin + 80, y)
      doc.text('Jersey', margin + 100, y)
      doc.text('Position', margin + 120, y)
      y += 7

      const sorted = [...detail.players].sort((a, b) => a.position_index - b.position_index)
      sorted.forEach((p, i) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        const bg = i % 2 === 0 ? [248, 248, 248] : [255, 255, 255]
        doc.setFillColor(bg[0], bg[1], bg[2])
        doc.rect(margin, y - 4.5, pageW - margin * 2, 7, 'F')

        doc.setTextColor(30, 30, 30)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(String(i + 1), margin + 2, y)
        doc.text(p.full_name, margin + 12, y)
        doc.text(String(p.age), margin + 80, y)
        doc.text(String((p as any).jersey_number ?? '—'), margin + 100, y)
        doc.text(String((p as any).position ?? '—'), margin + 120, y)
        y += 7
      })
    }

    y += 8

    // ── Footer ──
    doc.setDrawColor(249, 115, 22)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 6
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(150, 150, 150)
    doc.text('Shining Star United FC — Tournament Registration System', pageW / 2, y, { align: 'center' })
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW / 2, y + 5, { align: 'center' })

    doc.save(`${detail.registration_id}_${detail.team_name.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{detail.team_name}</h2>
          <p className="text-gray-400 text-sm font-mono">{detail.registration_id}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendReminder}
            disabled={reminderLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors text-xs font-semibold"
            title="Send reminder email to team manager"
          >
            {reminderLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            Reminder
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </motion.button>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {/* Status hint for pending teams with no payment */}
      {detail.status === 'pending' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Awaiting payment submission. You can reject this registration now.
        </div>
      )}

      {/* Team info */}
      <div className="glass-card p-4 space-y-3">
        {[
          { icon: User, label: 'Manager', value: detail.manager_name },
          { icon: Phone, label: 'Phone', value: detail.contact_phone },
          { icon: Mail, label: 'Email', value: detail.contact_email },
          { icon: Users, label: 'Players', value: `${detail.player_count} players` },
          ...(detail.address ? [{ icon: MapPin, label: 'Address', value: detail.address }] : []),
          {
            icon: Calendar, label: 'Registered',            value: new Date(detail.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            }),
          },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-gray-500 text-sm w-16 shrink-0">{label}</span>
            <span className="text-white text-sm">{value}</span>
          </div>
        ))}
      </div>

      {/* Players accordion */}
      {detail.players.length > 0 && (
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => setShowPlayers(!showPlayers)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
          >
            <span className="text-white font-medium text-sm">
              Player Roster ({detail.players.length})
            </span>
            {showPlayers ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <AnimatePresence>
            {showPlayers && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {detail.players
                    .sort((a, b) => a.position_index - b.position_index)
                    .map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 py-2 border-t border-white/5">
                        <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-white text-sm flex-1">{p.full_name}</span>
                        <span className="text-gray-500 text-xs bg-white/5 px-2 py-0.5 rounded-full">
                          #{(p as any).jersey_number ?? '—'}
                        </span>
                        <span className="text-gray-400 text-xs bg-white/5 px-2 py-0.5 rounded-full">
                          {(p as any).position ?? '—'}
                        </span>
                        <span className="text-gray-500 text-xs">Age {p.age}</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Payment proof — fetched with JWT via Axios, displayed as blob URL */}
      {detail.payment_proof && (
        <div className="glass-card p-4">
          <p className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <Image className="w-4 h-4 text-orange-400" />
            Payment Proof
          </p>
          {proofError ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
              <AlertCircle className="w-4 h-4" />
              Could not load image.
            </div>
          ) : proofBlobUrl ? (
            <img
              src={proofBlobUrl}
              alt={`Payment proof for ${detail.team_name}`}
              className="w-full rounded-xl object-contain max-h-64 bg-black/20"
            />
          ) : (
            <div className="flex items-center justify-center h-24 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
          <p className="text-gray-500 text-xs mt-2">
            {detail.payment_proof.original_filename} · {(detail.payment_proof.file_size_bytes / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      {/* Approve / Reject actions — always shown for non-terminal statuses */}
      {!isTerminal && (
        <div className="flex gap-3">
          <motion.button
            whileHover={canApprove ? { scale: 1.02 } : {}}
            whileTap={canApprove ? { scale: 0.98 } : {}}
            onClick={() => canApprove && handleAction('approved')}
            disabled={!canApprove || !!actionLoading}
            title={!canApprove ? 'Payment proof required before approving' : 'Approve this registration'}
            className={`flex-1 py-3 inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all
              ${canApprove
                ? 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
                : 'bg-green-900/30 text-green-700 cursor-not-allowed border border-green-900/40'
              }`}
          >
            {actionLoading === 'approved' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve
          </motion.button>

          <motion.button
            whileHover={canReject ? { scale: 1.02 } : {}}
            whileTap={canReject ? { scale: 0.98 } : {}}
            onClick={() => canReject && handleAction('rejected')}
            disabled={!canReject || !!actionLoading}
            className="btn-danger flex-1 py-3"
          >
            {actionLoading === 'rejected' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Reject
          </motion.button>
        </div>
      )}

      {/* Terminal status message */}
      {isTerminal && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border
          ${detail.status === 'approved'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {detail.status === 'approved'
            ? <><CheckCircle className="w-4 h-4 shrink-0" /> This registration has been approved.</>
            : <><XCircle className="w-4 h-4 shrink-0" /> This registration has been rejected.</>
          }
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </motion.div>
      )}

      {/* Delete button */}
      <div className="pt-4 border-t border-white/5">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteLoading}
            className="w-full py-2.5 inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all
              bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/40 hover:border-red-900/60"
          >
            <Trash2 className="w-4 h-4" />
            Delete Registration
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Are you sure?</p>
                <p className="text-xs text-red-400/80 mt-1">
                  This will permanently delete the team registration, all player data, and uploaded files. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all
                  bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all
                  bg-red-600 hover:bg-red-500 text-white"
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
