import client from './client'

export interface NewsItem {
  title: string
  description: string
  source: string
  url: string
  image?: string | null
  published_date: string
  category: 'local' | 'international'
}

export interface NewsResponse {
  items: NewsItem[]
  count: number
  cached: boolean
}

/**
 * Fetch football news from the backend
 */
export async function fetchFootballNews(useCache: boolean = true): Promise<NewsResponse> {
  const res = await client.get('/news/football', {
    params: { limit: 15 }
  })
  
  // Transform backend response to component format
  const data = res.data
  return {
    items: data.articles.map((a: any) => ({
      title: a.title,
      description: a.description,
      source: a.source,
      url: a.url,
      image: a.image,
      published_date: a.published_at,
      category: a.category
    })),
    count: data.total,
    cached: data.cached
  }
}

/**
 * Refresh football news (bypass cache)
 */
export async function refreshFootballNews(): Promise<NewsResponse> {
  return fetchFootballNews(false)
}
