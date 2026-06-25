import client from './client'

export interface TopScorerStats {
  player_name: string
  team_name: string
  goals: number
  assists: number
}

export interface TopScorersResponse {
  top_scorers: TopScorerStats[]
  top_assists: TopScorerStats[]
}

/**
 * Get top goal scorers and top assist providers for the tournament
 */
export async function getTopScorers(): Promise<TopScorersResponse> {
  // Add cache-busting query parameter to force fresh data
  const res = await client.get('/analytics/top-scorers?t=' + Date.now())
  return res.data
}
