import client from './client'

export interface MatchCreate {
  team_a_id?: string | null
  team_b_id?: string | null
  team_a_name?: string | null
  team_b_name?: string | null
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

export interface TimerUpdate {
  current_minute?: number
  is_extra_time?: boolean
  is_paused?: boolean
}

export interface MatchResponse {
  id: string
  team_a_id: string | null
  team_b_id: string | null
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
  bracket_slot?: number | null
  next_match_id?: string | null
  match_start_time?: string | null
  match_end_time?: string | null
  current_minute?: number
  is_extra_time?: boolean
  is_paused?: boolean
}

export const VALID_ROUNDS = [
  'Round 1',
  'Round 2',
  'Round 3',
  'Quarter-Final',
  'Semi-Final',
  'Final',
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

export const updateTimer = (id: string, data: TimerUpdate) =>
  client.patch<MatchResponse>(`/matches/${id}/timer`, data).then((r) => r.data)
