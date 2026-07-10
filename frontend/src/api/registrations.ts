import client from './client'
import { cache, CACHE_TTL, cacheKeys } from '../utils/cache'

export interface TeamCreateData {
  team_name: string
  manager_name: string
  contact_phone: string
  contact_email: string
  player_count: number
  address?: string
}

export interface PlayerData {
  full_name: string
  age: number
  jersey_number: number
  position: string
}

export interface TeamResponse {
  id: string
  registration_id: string
  team_name: string
  manager_name: string
  contact_phone: string
  contact_email: string
  player_count: number
  status: string
  created_at: string
}

export interface PendingRegistration {
  registration_id: string
  status: string
  current_step: number
  team_data: TeamCreateData
  players: PlayerData[]
}

export async function createTeam(data: TeamCreateData, logo?: File): Promise<TeamResponse> {
  // Always send JSON — logo upload is handled separately if needed
  const res = await client.post('/registrations', data)
  // Clear registrations cache when new team is created
  cache.clear(cacheKeys.registrations())
  return res.data
}

export async function submitPlayers(
  registrationId: string,
  players: PlayerData[]
): Promise<void> {
  await client.post(`/registrations/${registrationId}/players`, players)
  // Clear cache when players are submitted
  cache.clear(cacheKeys.registration(registrationId))
}

export async function uploadPayment(
  registrationId: string,
  file: File
): Promise<{ status: string; registration_id: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await client.post(`/registrations/${registrationId}/payment`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  // Clear cache when payment is uploaded
  cache.clear(cacheKeys.registration(registrationId))
  return res.data
}

export async function getStatus(
  registrationId: string
): Promise<{ registration_id: string; status: string; team_name: string }> {
  const cacheKey = cacheKeys.registration(registrationId)
  
  // Check cache first
  const cached = cache.get<{ registration_id: string; status: string; team_name: string }>(cacheKey)
  if (cached) return cached

  const res = await client.get(`/registrations/${registrationId}/status`)
  
  // Cache the result for 5 minutes
  cache.set(cacheKey, res.data, CACHE_TTL.MEDIUM)
  
  return res.data
}

export async function getPendingRegistration(
  email: string
): Promise<PendingRegistration | null> {
  try {
    const res = await client.get('/registrations/resume/by-email', {
      params: { email },
    })
    return res.data
  } catch (err: any) {
    // Return null if no pending registration found (404)
    if (err.response?.status === 404) {
      return null
    }
    throw err
  }
}
