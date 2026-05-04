import client from './client'

export interface TeamCreateData {
  team_name: string
  manager_name: string
  contact_phone: string
  contact_email: string
  player_count: number
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

export async function createTeam(data: TeamCreateData, logo?: File): Promise<TeamResponse> {
  // Always send JSON — logo upload is handled separately if needed
  const res = await client.post('/registrations', data)
  return res.data
}

export async function submitPlayers(
  registrationId: string,
  players: PlayerData[]
): Promise<void> {
  await client.post(`/registrations/${registrationId}/players`, players)
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
  return res.data
}

export async function getStatus(
  registrationId: string
): Promise<{ registration_id: string; status: string; team_name: string }> {
  const res = await client.get(`/registrations/${registrationId}/status`)
  return res.data
}
