import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2, Users, Mail, Phone, User, Shield, MapPin } from 'lucide-react'
import FileUpload from '../shared/FileUpload'
import { createTeam } from '../../api/registrations'
import { extractErrorMessage } from '../../api/errors'
import { useRegistrationStore } from '../../store/registrationStore'

const schema = z.object({
  team_name: z.string().min(1, 'Team name is required').max(100, 'Max 100 characters'),
  manager_name: z.string().min(1, 'Manager name is required').max(100, 'Max 100 characters'),
  contact_phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  contact_email: z.string().email('Enter a valid email address'),
  player_count: z
    .number({ invalid_type_error: 'Player count is required' })
    .int()
    .min(11, 'Minimum 11 players')
    .max(18, 'Maximum 18 players'),
  address: z.string().max(300, 'Max 300 characters').optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: () => void
}

export default function TeamDetailsStep({ onNext }: Props) {
  const { setTeamData, setRegistrationId } = useRegistrationStore()
  const [logo, setLogo] = useState<File | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      const team = await createTeam(data, logo || undefined)
      setTeamData(data)
      setRegistrationId(team.registration_id)
      onNext()
    } catch (err: any) {
      setServerError(extractErrorMessage(err))
    }
  }

  const fields = [
    {
      name: 'team_name' as const,
      label: 'Team Name',
      placeholder: 'e.g. Lions FC',
      icon: Shield,
      type: 'text',
    },
    {
      name: 'manager_name' as const,
      label: 'Manager Name',
      placeholder: 'Full name of team manager',
      icon: User,
      type: 'text',
    },
    {
      name: 'contact_phone' as const,
      label: 'Contact Phone',
      placeholder: '10-digit mobile number',
      icon: Phone,
      type: 'tel',
    },
    {
      name: 'contact_email' as const,
      label: 'Contact Email',
      placeholder: 'manager@example.com',
      icon: Mail,
      type: 'email',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Team Details</h2>
        <p className="text-gray-400">Tell us about your team and manager.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {fields.map(({ name, label, placeholder, icon: Icon, type }) => (
          <div key={name}>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-orange-400" />
                {label}
              </span>
            </label>
            <input
              {...register(name)}
              type={type}
              placeholder={placeholder}
              className={`input-field ${errors[name] ? 'input-error' : ''}`}
            />
            {errors[name] && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-text"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors[name]?.message}
              </motion.p>
            )}
          </div>
        ))}

        {/* Player count */}
        <div>
          <label className="label">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              Number of Players (11–18)
            </span>
          </label>
          <input
            {...register('player_count', { valueAsNumber: true })}
            type="number"
            min={7}
            max={18}
            placeholder="e.g. 11"
            className={`input-field ${errors.player_count ? 'input-error' : ''}`}
          />
          {errors.player_count && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="error-text">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.player_count.message}
            </motion.p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="label">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Address (optional)
            </span>
          </label>
          <input
            {...register('address')}
            type="text"
            placeholder="Village / Town, District"
            className={`input-field ${errors.address ? 'input-error' : ''}`}
          />
          {errors.address && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="error-text">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.address.message}
            </motion.p>
          )}
        </div>

        {/* Logo upload */}
        <div>
          <label className="label">Team Logo (optional)</label>          <FileUpload
            accept="image/jpeg,image/png"
            maxSizeBytes={2 * 1024 * 1024}
            label="Upload team logo (JPEG/PNG, max 2 MB)"
            onFileSelect={setLogo}
          />
        </div>

        {/* Server error */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {serverError}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-4 text-base mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue to Players →'
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
