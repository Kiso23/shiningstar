import client from './client'

export interface MatchEventResponse {
  id: string
  match_id: string
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'own_goal'
  team: 'team_a' | 'team_b'
  player_name: string
  time_minute: number
  player_replaced?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface MatchEventListResponse {
  match_id: string
  events: MatchEventResponse[]
  total_goals_team_a: number
  total_goals_team_b: number
  total_yellow_cards_team_a: number
  total_yellow_cards_team_b: number
  total_red_cards_team_a: number
  total_red_cards_team_b: number
}

export interface MatchEventCreate {
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'own_goal'
  team: 'team_a' | 'team_b'
  player_name: string
  time_minute: number
  player_replaced?: string | null
  notes?: string | null
}

/**
 * Get all events for a match with statistics
 */
export async function getMatchEvents(matchId: string): Promise<MatchEventListResponse> {
  const response = await client.get(`/matches/${matchId}/events`)
  return response.data
}

/**
 * Add an event to a match (admin only)
 */
export async function createMatchEvent(
  matchId: string,
  data: MatchEventCreate
): Promise<MatchEventResponse> {
  const response = await client.post(`/matches/${matchId}/events`, data)
  return response.data
}

/**
 * Update a match event (admin only)
 */
export async function updateMatchEvent(
  matchId: string,
  eventId: string,
  data: Partial<MatchEventCreate>
): Promise<MatchEventResponse> {
  const response = await client.patch(`/matches/${matchId}/events/${eventId}`, data)
  return response.data
}

/**
 * Delete a match event (admin only)
 */
export async function deleteMatchEvent(
  matchId: string,
  eventId: string
): Promise<void> {
  await client.delete(`/matches/${matchId}/events/${eventId}`)
}
