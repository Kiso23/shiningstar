import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2, Star } from 'lucide-react'
import { submitPlayers } from '../../api/registrations'
import { extractErrorMessage } from '../../api/errors'
import { useRegistrationStore } from '../../store/registrationStore'

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const
const REQUIRED_PLAYERS = 7 // First 7 are mandatory

// Required player schema (all fields mandatory)
const requiredPlayerSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  age: z.number({ invalid_type_error: 'Age is required' }).int().min(5, 'Min 5').max(60, 'Max 60'),
  jersey_number: z
    .number({ invalid_type_error: 'Jersey # required' })
    .int()
    .min(1, 'Min 1')
    .max(99, 'Max 99'),
  position: z.enum(POSITIONS, { errorMap: () => ({ message: 'Select a position' }) }),
})

// Optional player schema (all fields optional — skip if empty)
const optionalPlayerSchema = z.object({
  full_name: z.string().max(100).optional().or(z.literal('')),
  age: z.number().int().min(5).max(60).optional().or(z.nan()),
  jersey_number: z.number().int().min(1).max(99).optional().or(z.nan()),
  position: z.string().optional().or(z.literal('')),
})

const schema = z.object({
  required_players: z.array(requiredPlayerSchema),
  optional_players: z.array(optionalPlayerSchema),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function PlayerDetailsStep({ onNext, onBack }: Props) {
  const { registrationId, teamData, setPlayerData } = useRegistrationStore()
  const playerCount = teamData?.player_count || 11
  const optionalCount = Math.max(0, playerCount - REQUIRED_PLAYERS)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      required_players: Array.from({ length: REQUIRED_PLAYERS }, () => ({
        full_name: '',
        age: '' as any,
        jersey_number: '' as any,
        position: '' as any,
      })),
      optional_players: Array.from({ length: Math.max(optionalCount, 11) }, () => ({
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
      // Combine required + filled optional players
      const allPlayers = [
        ...data.required_players.map((p) => ({
          full_name: p.full_name,
          age: p.age,
          jersey_number: p.jersey_number,
          position: p.position,
        })),
        ...data.optional_players
          .filter((p) => p.full_name && p.full_name.trim() !== '')
          .map((p) => ({
            full_name: p.full_name as string,
            age: p.age as number,
            jersey_number: p.jersey_number as number,
            position: p.position as string,
          })),
      ]
      await submitPlayers(registrationId, allPlayers)
      setPlayerData(allPlayers as any)
      onNext()
    } catch (err) {
      setServerError(extractErrorMessage(err))
    }
  }

  const renderPlayerCard = (i: number, isRequired: boolean, fieldPrefix: 'required_players' | 'optional_players', idx: number) => {
    const playerErrors = isRequired
      ? (errors.required_players?.[idx] as any)
      : (errors.optional_players?.[idx] as any)

    return (
      <motion.div
        key={`${fieldPrefix}-${idx}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
        className={`glass-card p-4 ${isRequired ? 'border-orange-500/20' : 'border-white/5'}`}
        style={{ borderWidth: 1, borderStyle: 'solid' }}
      >
        {/* Player header */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isRequired ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-gray-400'
          }`}>
            {i + 1}
          </div>
          <span className="text-sm font-medium text-gray-300">Player {i + 1}</span>
          {isRequired ? (
            <span className="flex items-center gap-1 text-xs text-orange-400 font-semibold ml-auto">
              <Star className="w-3 h-3 fill-orange-400" /> Required
            </span>
          ) : (
            <span className="text-xs text-gray-600 ml-auto">Optional</span>
          )}
        </div>

        {/* Row 1: Name + Jersey */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="col-span-2">
            <label className="label text-xs">Full Name {isRequired ? '*' : ''}</label>
            <input
              {...register(`${fieldPrefix}.${idx}.full_name` as any)}
              placeholder="Player name"
              className={`input-field text-sm py-2 ${playerErrors?.full_name ? 'input-error' : ''}`}
            />
            {playerErrors?.full_name && (
              <p className="error-text text-xs mt-0.5">
                <AlertCircle className="w-3 h-3" />
                {playerErrors.full_name?.message}
              </p>
            )}
          </div>
          <div>
            <label className="label text-xs">Jersey #{isRequired ? ' *' : ''}</label>
            <input
              {...register(`${fieldPrefix}.${idx}.jersey_number` as any, { valueAsNumber: true })}
              type="number"
              min={1}
              max={99}
              placeholder="e.g. 10"
              className={`input-field text-sm py-2 ${playerErrors?.jersey_number ? 'input-error' : ''}`}
            />
            {playerErrors?.jersey_number && (
              <p className="error-text text-xs mt-0.5">
                <AlertCircle className="w-3 h-3" />
                {playerErrors.jersey_number?.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Position + Age */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label text-xs">Position{isRequired ? ' *' : ''}</label>
            <select
              {...register(`${fieldPrefix}.${idx}.position` as any)}
              className={`input-field text-sm py-2 appearance-none cursor-pointer ${playerErrors?.position ? 'input-error' : ''}`}
            >
              <option value="" className="bg-gray-900">Select...</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p} className="bg-gray-900">{p}</option>
              ))}
            </select>
            {playerErrors?.position && (
              <p className="error-text text-xs mt-0.5">
                <AlertCircle className="w-3 h-3" />
                {playerErrors.position?.message}
              </p>
            )}
          </div>
          <div>
            <label className="label text-xs">Age{isRequired ? ' *' : ''}</label>
            <input
              {...register(`${fieldPrefix}.${idx}.age` as any, { valueAsNumber: true })}
              type="number"
              min={5}
              max={60}
              placeholder="Age"
              className={`input-field text-sm py-2 ${playerErrors?.age ? 'input-error' : ''}`}
            />
            {playerErrors?.age && (
              <p className="error-text text-xs mt-0.5">
                <AlertCircle className="w-3 h-3" />
                {playerErrors.age?.message}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    )
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
          <span className="text-orange-400 font-semibold flex items-center gap-1 inline-flex">
            <Star className="w-3.5 h-3.5 fill-orange-400" /> First 7 players are required.
          </span>{' '}
          Players 8–18 are optional.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-3">

          {/* Required players 1–11 */}
          {Array.from({ length: REQUIRED_PLAYERS }, (_, idx) =>
            renderPlayerCard(idx, true, 'required_players', idx)
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 font-medium">Optional Players (8–18)</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Optional players 8–18 */}
          {Array.from({ length: 11 }, (_, idx) =>
            renderPlayerCard(REQUIRED_PLAYERS + idx, false, 'optional_players', idx)
          )}
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
