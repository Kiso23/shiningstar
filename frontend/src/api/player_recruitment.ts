import client from './client'
import { cache, CACHE_TTL, cacheKeys } from '../utils/cache'

export type PlayerPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'striker'
export type RecruitmentStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'

export interface PlayerRecruitmentCreate {
  full_name: string
  email: string
  phone: string
  age: number
  date_of_birth?: string
  address: string
  city: string
  state: string
  postal_code?: string
  position: PlayerPosition
  jersey_number?: number
  height?: number
  weight?: number
  years_of_experience: number
  previous_clubs?: string
  achievements?: string
  preferred_foot?: string
  injuries_or_concerns?: string
  additional_notes?: string
}

export interface PlayerRecruitmentResponse extends PlayerRecruitmentCreate {
  id: string
  photo_url?: string
  status: RecruitmentStatus
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface PlayerRecruitmentList {
  id: string
  full_name: string
  email: string
  phone: string
  position: PlayerPosition
  age: number
  status: RecruitmentStatus
  created_at: string
}

export interface PlayerRecruitmentUpdate {
  status: RecruitmentStatus
  admin_notes?: string
}

// Public endpoint - submit player recruitment form
export const submitPlayerRecruitment = async (
  data: PlayerRecruitmentCreate,
  photo?: File
): Promise<PlayerRecruitmentResponse> => {
  const formData = new FormData()
  
  // Add all form fields - convert to proper types
  formData.append('full_name', data.full_name)
  formData.append('email', data.email)
  formData.append('phone', data.phone)
  formData.append('age', String(data.age))
  if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth)
  
  formData.append('address', data.address)
  formData.append('city', data.city)
  formData.append('state', data.state)
  if (data.postal_code) formData.append('postal_code', data.postal_code)
  
  formData.append('position', data.position)
  if (data.jersey_number) formData.append('jersey_number', String(data.jersey_number))
  if (data.height) formData.append('height', String(data.height))
  if (data.weight) formData.append('weight', String(data.weight))
  
  formData.append('years_of_experience', String(data.years_of_experience))
  if (data.previous_clubs) formData.append('previous_clubs', data.previous_clubs)
  if (data.achievements) formData.append('achievements', data.achievements)
  if (data.preferred_foot) formData.append('preferred_foot', data.preferred_foot)
  if (data.injuries_or_concerns) formData.append('injuries_or_concerns', data.injuries_or_concerns)
  if (data.additional_notes) formData.append('additional_notes', data.additional_notes)
  
  // Add photo if provided
  if (photo) {
    formData.append('photo', photo)
  }

  const response = await client.post('/player-recruitment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  
  // Clear recruitment cache when new application is submitted
  cache.clear('player-recruitment:list')
  
  return response.data
}

// Admin endpoints
export const listPlayerRecruitments = async (
  skip: number = 0,
  limit: number = 50,
  statusFilter?: string,
  positionFilter?: string
): Promise<PlayerRecruitmentList[]> => {
  const cacheKey = `player-recruitment:list:${statusFilter || 'all'}:${positionFilter || 'all'}`
  
  // Check cache first
  const cached = cache.get<PlayerRecruitmentList[]>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams()
  params.append('skip', skip.toString())
  params.append('limit', limit.toString())
  if (statusFilter) params.append('status_filter', statusFilter)
  if (positionFilter) params.append('position_filter', positionFilter)

  const response = await client.get(`/player-recruitment/admin/applications?${params}`)
  
  // Cache the result for 5 minutes
  cache.set(cacheKey, response.data, CACHE_TTL.MEDIUM)
  
  return response.data
}

export const getPlayerRecruitment = async (
  playerId: string,
  skipCache: boolean = false
): Promise<PlayerRecruitmentResponse> => {
  const cacheKey = `player-recruitment:${playerId}`
  
  // Check cache first (unless explicitly skipped)
  if (!skipCache) {
    const cached = cache.get<PlayerRecruitmentResponse>(cacheKey)
    if (cached) return cached
  }

  const response = await client.get(`/player-recruitment/admin/applications/${playerId}`)
  
  // Cache the result for 5 minutes
  cache.set(cacheKey, response.data, CACHE_TTL.MEDIUM)
  
  return response.data
}

export const updatePlayerRecruitmentStatus = async (
  playerId: string,
  updateData: PlayerRecruitmentUpdate
): Promise<PlayerRecruitmentResponse> => {
  const response = await client.patch(
    `/player-recruitment/admin/applications/${playerId}`,
    updateData
  )
  
  // Invalidate all related caches when recruitment is updated
  cache.clear(`player-recruitment:${playerId}`)
  cache.clear('player-recruitment:list:all:all')
  cache.clear('player-recruitment:list:pending:all')
  cache.clear('player-recruitment:list:reviewed:all')
  cache.clear('player-recruitment:list:shortlisted:all')
  cache.clear('player-recruitment:list:accepted:all')
  cache.clear('player-recruitment:list:rejected:all')
  cache.clear('player-recruitment:count:all:all')
  
  return response.data
}

export const deletePlayerRecruitment = async (playerId: string): Promise<void> => {
  await client.delete(`/player-recruitment/admin/applications/${playerId}`)
  
  // Invalidate all related caches when recruitment is deleted
  cache.clear(`player-recruitment:${playerId}`)
  cache.clear('player-recruitment:list:all:all')
  cache.clear('player-recruitment:list:pending:all')
  cache.clear('player-recruitment:list:reviewed:all')
  cache.clear('player-recruitment:list:shortlisted:all')
  cache.clear('player-recruitment:list:accepted:all')
  cache.clear('player-recruitment:list:rejected:all')
  cache.clear('player-recruitment:count:all:all')
}

export const getPlayerRecruitmentsCount = async (
  statusFilter?: string,
  positionFilter?: string
): Promise<{ count: number }> => {
  const cacheKey = `player-recruitment:count:${statusFilter || 'all'}:${positionFilter || 'all'}`
  
  // Check cache first
  const cached = cache.get<{ count: number }>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams()
  if (statusFilter) params.append('status_filter', statusFilter)
  if (positionFilter) params.append('position_filter', positionFilter)

  const response = await client.get(`/player-recruitment/admin/applications-count?${params}`)
  
  // Cache the result for 5 minutes
  cache.set(cacheKey, response.data, CACHE_TTL.MEDIUM)
  
  return response.data
}

// Clear all player recruitment caches
export const clearPlayerRecruitmentCache = (): void => {
  cache.clear('player-recruitment:list:all:all')
  cache.clear('player-recruitment:list:pending:all')
  cache.clear('player-recruitment:list:reviewed:all')
  cache.clear('player-recruitment:list:shortlisted:all')
  cache.clear('player-recruitment:list:accepted:all')
  cache.clear('player-recruitment:list:rejected:all')
  cache.clear('player-recruitment:count:all:all')
  // Clear all individual player caches
  cache.clearAll()
}
