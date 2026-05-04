import client from './client'

export interface DailyStat {
  date: string
  visits: number
}

export interface PageStat {
  page: string
  visits: number
}

export interface AnalyticsSummary {
  total_visits: number
  unique_visitors: number
  today_visits: number
  by_page: PageStat[]
  last_7_days: DailyStat[]
}

export async function trackVisit(page: string): Promise<void> {
  const device = window.innerWidth < 768 ? 'mobile' : 'desktop'
  try {
    await client.post('/analytics/track', { page, device })
  } catch {
    // silently ignore — tracking should never break the page
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await client.get('/analytics/summary')
  return res.data
}
