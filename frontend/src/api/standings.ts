import client from './client'

export interface StandingResponse {
  team_id: string
  team_name: string
  team_logo: string | null
  played: number
  wins: number
  draws: number
  losses: number
  goals_scored: number
  goals_conceded: number
  goal_difference: number
  points: number
}

export const getStandings = () =>
  client.get<StandingResponse[]>('/standings').then((r) => r.data)

export const clearStandings = () =>
  client.delete('/standings')
