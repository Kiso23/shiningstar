import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2 } from 'lucide-react'
import { submitPlayers } from '../../api/registrations'
import { extractErrorMessage } from '../../api/errors'
import { useRegistrationStore } from '../../store/registrationStore'

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const

const playerSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  age: z.number({ invalid_type_error: 'Age is required' }).int().min(5, 'Min 5').max(60, 'Max 60'),
  jersey_number: z
    .number({ invalid_type_error: 'Jersey # required' })
    .int()
    .min(1, 'Min 1')
    .max(99, 'Max 99'),
  position: z.enum(POSITIONS, { errorMap: () => ({ message: 'Select a position' }) }),
})

const schema = z.object({
  players: z.array(playerSchema),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function PlayerDetailsStep({ onNext, onBack }: Props) {
  const { registrationId, teamData, setPlayerData } = useRegistrationStore()
  const playerCount = teamData?.player_count || 7
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      players: Array.from({ length: playerCount }, () => ({
        full_name: '',
        age: '' as any,
        jersey_number: '' as any,
        position: '' as any,
      })),
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!registrationId) return
    setServerError(null)
    try {
      await submitPlayers(registrationId, data.players)
      setPlayerData(data.players as any)
      onNext()
    } catch (err) {
      setServerError(extractErrorMessage(err))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Player Roster</h2>
        <p className="text-gray-400 text-sm">
          Fill in details for all{' '}
          <span className="text-orange-400 font-semibold">{playerCount} players</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {Array.from({ length: playerCount }, (_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4"
            >
              {/* Player header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-gray-300">Player {i + 1}</span>
              </div>

              {/* Row 1: Name + Jersey */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="col-span-2">
                  <label className="label text-xs">Full Name *</label>
                  <input
                    {...register(`players.${i}.full_name`)}
                    placeholder="Player name"
                    className={`input-field text-sm py-2 ${errors.players?.[i]?.full_name ? 'input-error' : ''}`}
                  />
                  {errors.players?.[i]?.full_name && (
                    <p className="error-text text-xs mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.players[i]?.full_name?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label text-xs">Jersey # *</label>
                  <input
                    {...register(`players.${i}.jersey_number`, { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={99}
                    placeholder="e.g. 10"
                    className={`input-field text-sm py-2 ${errors.players?.[i]?.jersey_number ? 'input-error' : ''}`}
                  />
                  {errors.players?.[i]?.jersey_number && (
                    <p className="error-text text-xs mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.players[i]?.jersey_number?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Position + Age */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">Position *</label>
                  <select
                    {...register(`players.${i}.position`)}
                    className={`input-field text-sm py-2 appearance-none cursor-pointer ${errors.players?.[i]?.position ? 'input-error' : ''}`}
                  >
                    <option value="" className="bg-gray-900">Select...</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p} className="bg-gray-900">{p}</option>
                    ))}
                  </select>
                  {errors.players?.[i]?.position && (
                    <p className="error-text text-xs mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.players[i]?.position?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label text-xs">Age *</label>
                  <input
                    {...register(`players.${i}.age`, { valueAsNumber: true })}
                    type="number"
                    min={5}
                    max={60}
                    placeholder="Age"
                    className={`input-field text-sm py-2 ${errors.players?.[i]?.age ? 'input-error' : ''}`}
                  />
                  {errors.players?.[i]?.age && (
                    <p className="error-text text-xs mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.players[i]?.age?.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {serverError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {serverError}
          </motion.div>
        )}

        <div className="flex gap-3 pt-1">
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary flex-1 py-4"
          >
            ← Back
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex-1 py-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Payment →'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
