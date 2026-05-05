import client from './client'

export interface TournamentDateResponse {
  tournament_start: string
}

export interface BannerResponse {
  banner_line1: string
  banner_line2: string
}

export interface AllSettingsResponse {
  tournament_start: string
  banner_line1: string
  banner_line2: string
}

export async function getTournamentDate(): Promise<TournamentDateResponse> {
  const res = await client.get('/settings/tournament-date')
  return res.data
}

export async function updateTournamentDate(tournament_start: string): Promise<TournamentDateResponse> {
  const res = await client.put('/settings/tournament-date', { tournament_start })
  return res.data
}

export async function getAllSettings(): Promise<AllSettingsResponse> {
  const res = await client.get('/settings/all')
  return res.data
}

export async function updateBanner(banner_line1: string, banner_line2: string): Promise<BannerResponse> {
  const res = await client.put('/settings/banner', { banner_line1, banner_line2 })
  return res.data
}
