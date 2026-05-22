import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2, Upload, User, Mail, Phone, MapPin, Trophy, Zap } from 'lucide-react'
import { submitPlayerRecruitment, type PlayerPosition } from '../api/player_recruitment'

const POSITIONS: { value: PlayerPosition; label: string; emoji: string }[] = [
  { value: 'goalkeeper', label: 'Goalkeeper', emoji: '🧤' },
  { value: 'defender', label: 'Defender', emoji: '🛡️' },
  { value: 'midfielder', label: 'Midfielder', emoji: '⚙️' },
  { value: 'forward', label: 'Forward', emoji: '🎯' },
  { value: 'striker', label: 'Striker', emoji: '⚡' },
]

export default function PlayerRecruitmentPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: '',
    date_of_birth: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    position: 'midfielder' as PlayerPosition,
    jersey_number: '',
    height: '',
    weight: '',
    years_of_experience: '0',
    previous_clubs: '',
    achievements: '',
    preferred_foot: 'right',
    injuries_or_concerns: '',
    additional_notes: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await submitPlayerRecruitment(
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          date_of_birth: formData.date_of_birth || undefined,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code || undefined,
          position: formData.position,
          jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          years_of_experience: parseInt(formData.years_of_experience),
          previous_clubs: formData.previous_clubs || undefined,
          achievements: formData.achievements || undefined,
          preferred_foot: formData.preferred_foot || undefined,
          injuries_or_concerns: formData.injuries_or_concerns || undefined,
          additional_notes: formData.additional_notes || undefined,
        },
        photo || undefined
      )
      setSubmitted(true)
      
      // Store the result for display
      sessionStorage.setItem('playerRecruitmentResult', JSON.stringify(result))
      
      // Redirect after 4 seconds
      setTimeout(() => navigate('/'), 4000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #080c08 0%, #0e1a0e 50%, #080c08 100%)' }}>

      {/* Header */}
      <motion.header initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderBottomColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(8,12,8,0.8)', backdropFilter: 'blur(20px)' }}>
        <motion.button whileHover={{ x: -3 }} onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </motion.button>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SSU" className="w-8 h-8 rounded-full object-cover border border-orange-500/40" />
          <span className="font-bold text-white text-sm hidden sm:block">Shining Star United</span>
        </div>
      </motion.header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Join <span style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Shining Star United</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Apply to join our football club and showcase your talent
            </p>
          </motion.div>

          {/* Success Message */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Application Submitted!</h2>
              <p className="text-gray-300 text-sm mb-4">
                Thank you for applying to Shining Star United FC. We'll review your application and get back to you soon.
              </p>
              
              {/* Show submitted photo */}
              {photoPreview && (
                <div className="mb-4 flex justify-center">
                  <img src={photoPreview} alt={formData.full_name} className="w-24 h-24 rounded-lg object-cover border-2 border-green-400" />
                </div>
              )}
              
              {/* Show submitted details */}
              <div className="bg-black/30 rounded-lg p-4 mb-4 text-left">
                <p className="text-gray-300 text-sm"><strong>Name:</strong> {formData.full_name}</p>
                <p className="text-gray-300 text-sm"><strong>Position:</strong> {formData.position}</p>
                <p className="text-gray-300 text-sm"><strong>Email:</strong> {formData.email}</p>
              </div>
              
              <p className="text-gray-500 text-xs">Redirecting to home...</p>
            </motion.div>
          )}

          {/* Recruitment Form */}
          {!submitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 sm:p-8"
              style={{ backgroundColor: 'rgba(17,31,17,0.85)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Player Photo</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-input"
                    />
                    <label htmlFor="photo-input"
                      className="flex items-center justify-center w-full px-4 py-8 rounded-xl bg-white/5 border-2 border-dashed border-white/10 cursor-pointer hover:border-orange-500/50 transition-colors">
                      {photoPreview ? (
                        <div className="text-center">
                          <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Click to change photo</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Click to upload photo</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit phone number"
                        pattern="^\d{10}$"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Age *</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="16-50"
                        min="16"
                        max="50"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-white mb-2">Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street address"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        placeholder="Postal code"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Football Information */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    Football Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Position */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Position *</label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                      >
                        {POSITIONS.map(pos => (
                          <option key={pos.value} value={pos.value}>
                            {pos.emoji} {pos.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Jersey Number */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Jersey Number</label>
                      <input
                        type="number"
                        name="jersey_number"
                        value={formData.jersey_number}
                        onChange={handleChange}
                        placeholder="1-99"
                        min="1"
                        max="99"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Height */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="140-220"
                        min="140"
                        max="220"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="40-150"
                        min="40"
                        max="150"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Years of Experience */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Years of Experience *</label>
                      <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleChange}
                        placeholder="0-50"
                        min="0"
                        max="50"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>

                    {/* Preferred Foot */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Preferred Foot</label>
                      <select
                        name="preferred_foot"
                        value={formData.preferred_foot}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                      >
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Experience & Achievements */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    Experience & Achievements
                  </h3>
                  <div className="space-y-4">
                    {/* Previous Clubs */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Previous Clubs</label>
                      <textarea
                        name="previous_clubs"
                        value={formData.previous_clubs}
                        onChange={handleChange}
                        placeholder="List any clubs you've played for..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                      />
                    </div>

                    {/* Achievements */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Achievements & Awards</label>
                      <textarea
                        name="achievements"
                        value={formData.achievements}
                        onChange={handleChange}
                        placeholder="Trophies, awards, recognitions..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                      />
                    </div>

                    {/* Injuries or Concerns */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Injuries or Health Concerns</label>
                      <textarea
                        name="injuries_or_concerns"
                        value={formData.injuries_or_concerns}
                        onChange={handleChange}
                        placeholder="Any injuries or health concerns we should know about..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                      />
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Additional Notes</label>
                      <textarea
                        name="additional_notes"
                        value={formData.additional_notes}
                        onChange={handleChange}
                        placeholder="Anything else you'd like us to know..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </motion.button>

              </form>

            </motion.div>
          )}

        </div>
      </main>

    </div>
  )
}
