import client from './client'

export interface TournamentDateResponse {
  tournament_start: string
}

export async function getTournamentDate(): Promise<TournamentDateResponse> {
  const res = await client.get('/settings/tournament-date')
  return res.data
}

export async function updateTournamentDate(tournament_start: string): Promise<TournamentDateResponse> {
  const res = await client.put('/settings/tournament-date', { tournament_start })
  return res.data
}
