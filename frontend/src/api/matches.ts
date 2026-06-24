import client from './client'

export interface MatchCreate {
  team_a_id: string
  team_b_id: string
  scheduled_at: string
  venue: string
  round: string
  group?: string
  team_a_logo?: string
  team_b_logo?: string
}

export interface MatchUpdate {
  scheduled_at?: string
  venue?: string
  round?: string
  group?: string
  team_a_logo?: string
  team_b_logo?: string
}

export interface ScoreUpdate {
  team_a_score?: number
  team_b_score?: number
  status?: 'scheduled' | 'live' | 'completed'
}

export interface MatchResponse {
  id: string
  team_a_id: string
  team_b_id: string
  team_a_name: string
  team_b_name: string
  team_a_logo?: string
  team_b_logo?: string
  team_a_score: number | null
  team_b_score: number | null
  status: 'scheduled' | 'live' | 'completed'
  round: string
  group: string | null
  scheduled_at: string
  venue: string
}

export const VALID_ROUNDS = [
  'Round of 32',
  'Round of 16',
  'Quarter-Final',
  'Semi-Final',
  'Final',
  'Third Place',
]

export const getMatches = (params?: { round?: string; status?: string }) =>
  client.get<MatchResponse[]>('/matches', { params }).then((r) => r.data)

export const getMatch = (id: string) =>
  client.get<MatchResponse>(`/matches/${id}`).then((r) => r.data)

export const createMatch = (data: MatchCreate) =>
  client.post<MatchResponse>('/matches', data).then((r) => r.data)

export const updateMatch = (id: string, data: MatchUpdate) =>
  client.patch<MatchResponse>(`/matches/${id}`, data).then((r) => r.data)

export const deleteMatch = (id: string) =>
  client.delete(`/matches/${id}`)

export const updateScore = (id: string, data: ScoreUpdate) =>
  client.patch<MatchResponse>(`/matches/${id}/score`, data).then((r) => r.data)
