import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle, Upload } from 'lucide-react'
import { createMatch, updateMatch, VALID_ROUNDS, type MatchResponse } from '../../api/matches'
import { extractErrorMessage } from '../../api/errors'

export interface TeamOption {
  id: string
  team_name: string
}

interface Props {
  onClose: () => void
  onSaved: () => void
  fixture?: MatchResponse
  teams: TeamOption[]
}

export default function FixtureForm({ onClose, onSaved, fixture, teams }: Props) {
  const isEdit = !!fixture

  // Determine if editing with registered or manual teams
  const isManualFixture = fixture && !fixture.team_a_id && !fixture.team_b_id

  const [teamAId, setTeamAId] = useState(fixture?.team_a_id ?? '')
  const [teamBId, setTeamBId] = useState(fixture?.team_b_id ?? '')
  const [teamAName, setTeamAName] = useState(fixture && !fixture.team_a_id ? fixture.team_a_name : '')
  const [teamBName, setTeamBName] = useState(fixture && !fixture.team_b_id ? fixture.team_b_name : '')
  const [teamALogo, setTeamALogo] = useState(fixture?.team_a_logo ?? '')
  const [teamBLogo, setTeamBLogo] = useState(fixture?.team_b_logo ?? '')
  const [teamALogoFile, setTeamALogoFile] = useState<File | null>(null)
  const [teamBLogoFile, setTeamBLogoFile] = useState<File | null>(null)
  const [teamALogoPreview, setTeamALogoPreview] = useState<string>('')
  const [teamBLogoPreview, setTeamBLogoPreview] = useState<string>('')
  const [useManualTeams, setUseManualTeams] = useState(isManualFixture ?? false)
  const [scheduledAt, setScheduledAt] = useState(() => {
    if (!fixture?.scheduled_at) return ''
    const date = new Date(fixture.scheduled_at)
    // Format as local time for datetime-local input - simple extraction
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  })
  const [venue, setVenue] = useState(fixture?.venue ?? '')
  const [round, setRound] = useState(fixture?.round ?? VALID_ROUNDS[0])
  const [group, setGroup] = useState(fixture?.group ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sameTeamError = 
    (useManualTeams && teamAName && teamBName && teamAName.toLowerCase() === teamBName.toLowerCase()) ||
    (!useManualTeams && teamAId && teamBId && teamAId === teamBId)

  const handleFileUpload = (file: File | null, isTeamA: boolean) => {
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (isTeamA) {
        setTeamALogoFile(file)
        setTeamALogoPreview(dataUrl)
      } else {
        setTeamBLogoFile(file)
        setTeamBLogoPreview(dataUrl)
      }
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sameTeamError) return

    setSubmitting(true)
    setError(null)
    try {
      // Use preview data URLs if files are uploaded, otherwise use URLs
      const teamALogoToSend = teamALogoPreview || teamALogo || undefined
      const teamBLogoToSend = teamBLogoPreview || teamBLogo || undefined

      // The datetime-local value is in user's local time (IST +05:30)
      // Convert it to UTC by subtracting the timezone offset, then send as ISO with Z
      const [datePart, timePart] = scheduledAt.split('T')
      const [year, month, day] = datePart.split('-')
      const [hours, minutes] = timePart.split(':')
      
      // Create local date
      const localDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        0
      )
      
      // Convert to UTC by subtracting the timezone offset (IST is +5:30, so subtract)
      const utcTime = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
      const utcIsoString = utcTime.toISOString()

      const payload = useManualTeams
        ? {
            team_a_id: null,
            team_b_id: null,
            team_a_name: teamAName.trim(),
            team_b_name: teamBName.trim(),
            scheduled_at: utcIsoString,
            venue,
            round,
            group: group || undefined,
            team_a_logo: teamALogoToSend,
            team_b_logo: teamBLogoToSend,
          }
        : {
            team_a_id: teamAId,
            team_b_id: teamBId,
            team_a_name: null,
            team_b_name: null,
            scheduled_at: utcIsoString,
            venue,
            round,
            group: group || undefined,
            team_a_logo: teamALogoToSend,
            team_b_logo: teamBLogoToSend,
          }

      if (isEdit) {
        // Convert local time to UTC ISO
        const [datePart, timePart] = scheduledAt.split('T')
        const [year, month, day] = datePart.split('-')
        const [hours, minutes] = timePart.split(':')
        
        const localDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          0
        )
        
        const utcTime = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
        const utcIsoString = utcTime.toISOString()
        
        await updateMatch(fixture.id, { 
          scheduled_at: utcIsoString, 
          venue, 
          round, 
          group: group || undefined,
          team_a_logo: teamALogoToSend,
          team_b_logo: teamBLogoToSend,
        })
      } else {
        await createMatch(payload as any)
      }
      onSaved()
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to save fixture.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card w-full max-w-lg p-6 max-h-[90vh] flex flex-col"
        >
          {/* Modal header */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-white font-bold text-xl">
              {isEdit ? 'Edit Fixture' : 'Add Fixture'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
            {/* Toggle between registered and manual teams */}
            {!isEdit && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="useManualTeams"
                  checked={useManualTeams}
                  onChange={(e) => {
                    setUseManualTeams(e.target.checked)
                    if (e.target.checked) {
                      setTeamAId('')
                      setTeamBId('')
                    } else {
                      setTeamAName('')
                      setTeamBName('')
                    }
                  }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="useManualTeams" className="flex-1 text-sm text-gray-300 cursor-pointer">
                  Add team manually (type team name)
                </label>
              </div>
            )}

            {/* Team A */}
            <div>
              <label className="label">Team A</label>
              {useManualTeams ? (
                <input
                  type="text"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  required
                  placeholder="Type team name and press Enter or comma"
                  className="input-field"
                  onKeyDown={(e) => {
                    if (e.key === ',' || e.key === 'Enter') {
                      e.preventDefault()
                      // Accept the current input
                    }
                  }}
                />
              ) : (
                <select
                  value={teamAId}
                  onChange={(e) => setTeamAId(e.target.value)}
                  required
                  disabled={isEdit}
                  className="input-field"
                >
                  <option value="" disabled>Select Team A</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.team_name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Team B */}
            <div>
              <label className="label">Team B</label>
              {useManualTeams ? (
                <input
                  type="text"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  required
                  placeholder="Type team name and press Enter or comma"
                  className="input-field"
                  onKeyDown={(e) => {
                    if (e.key === ',' || e.key === 'Enter') {
                      e.preventDefault()
                      // Accept the current input
                    }
                  }}
                />
              ) : (
                <select
                  value={teamBId}
                  onChange={(e) => setTeamBId(e.target.value)}
                  required
                  disabled={isEdit}
                  className="input-field"
                >
                  <option value="" disabled>Select Team B</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.team_name}</option>
                  ))}
                </select>
              )}
              {sameTeamError && (
                <p className="error-text">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Team A and Team B must be different
                </p>
              )}
            </div>

            {/* Team A Logo */}
            <div>
              <label className="label">Team A Logo/Flag <span className="text-gray-600">(optional)</span></label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-700 rounded-lg hover:border-orange-500/50 hover:bg-white/5 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Upload Image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, true)}
                      className="hidden"
                    />
                  </label>
                </div>
                {teamALogoPreview && (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <img
                      src={teamALogoPreview}
                      alt="Team A Logo"
                      className="w-10 h-10 rounded object-cover border border-orange-500/40"
                    />
                    <span className="text-xs text-gray-400">File uploaded</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTeamALogoFile(null)
                        setTeamALogoPreview('')
                      }}
                      className="ml-auto text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input
                  type="url"
                  value={teamALogo}
                  onChange={(e) => setTeamALogo(e.target.value)}
                  placeholder="Or paste image URL"
                  className="input-field text-xs"
                />
              </div>
            </div>

            {/* Team B Logo */}
            <div>
              <label className="label">Team B Logo/Flag <span className="text-gray-600">(optional)</span></label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-700 rounded-lg hover:border-orange-500/50 hover:bg-white/5 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Upload Image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, false)}
                      className="hidden"
                    />
                  </label>
                </div>
                {teamBLogoPreview && (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <img
                      src={teamBLogoPreview}
                      alt="Team B Logo"
                      className="w-10 h-10 rounded object-cover border border-orange-500/40"
                    />
                    <span className="text-xs text-gray-400">File uploaded</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTeamBLogoFile(null)
                        setTeamBLogoPreview('')
                      }}
                      className="ml-auto text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input
                  type="url"
                  value={teamBLogo}
                  onChange={(e) => setTeamBLogo(e.target.value)}
                  placeholder="Or paste image URL"
                  className="input-field text-xs"
                />
              </div>
            </div>

            {/* Date/Time */}
            <div>
              <label className="label">Date &amp; Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="input-field"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="label">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                placeholder="e.g. Rongbong Ronghang Playground"
                className="input-field"
              />
            </div>

            {/* Round */}
            <div>
              <label className="label">Round</label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                required
                className="input-field"
              >
                {VALID_ROUNDS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Group (optional) */}
            <div>
              <label className="label">Group <span className="text-gray-600">(optional)</span></label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="e.g. Group A"
                className="input-field"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 shrink-0 border-t border-white/10 -mx-6 -mb-6 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !!sameTeamError}
                className="btn-primary flex-1"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {isEdit ? 'Save Changes' : 'Create Fixture'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
