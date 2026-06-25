import { API_URL } from './config'

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
  const response = await fetch(`${API_URL}/matches/${matchId}/events`)
  if (!response.ok) {
    throw new Error(`Failed to fetch match events: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Add an event to a match (admin only)
 */
export async function createMatchEvent(
  matchId: string,
  data: MatchEventCreate
): Promise<MatchEventResponse> {
  const response = await fetch(`${API_URL}/matches/${matchId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to create match event: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Update a match event (admin only)
 */
export async function updateMatchEvent(
  matchId: string,
  eventId: string,
  data: Partial<MatchEventCreate>
): Promise<MatchEventResponse> {
  const response = await fetch(`${API_URL}/matches/${matchId}/events/${eventId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update match event: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Delete a match event (admin only)
 */
export async function deleteMatchEvent(
  matchId: string,
  eventId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/matches/${matchId}/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete match event: ${response.statusText}`)
  }
}
