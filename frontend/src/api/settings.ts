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
  hero_line1: string
  hero_line2: string
  hero_line3: string
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
  // Add cache-busting query parameter to force fresh data
  const res = await client.get('/settings/all?t=' + Date.now())
  return res.data
}

export async function updateBanner(banner_line1: string, banner_line2: string): Promise<BannerResponse> {
  const res = await client.put('/settings/banner', { banner_line1, banner_line2 })
  return res.data
}

export async function updateHero(hero_line1: string, hero_line2: string, hero_line3: string): Promise<{ hero_line1: string; hero_line2: string; hero_line3: string }> {
  const res = await client.put('/settings/hero', { hero_line1, hero_line2, hero_line3 })
  return res.data
}

export async function resetLeaderboardAndScorers(): Promise<{ message: string }> {
  const res = await client.post('/settings/reset-stats', {})
  return res.data
}
