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
  
  // Add all form fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  
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
  playerId: string
): Promise<PlayerRecruitmentResponse> => {
  const cacheKey = `player-recruitment:${playerId}`
  
  // Check cache first
  const cached = cache.get<PlayerRecruitmentResponse>(cacheKey)
  if (cached) return cached

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
  
  // Invalidate caches when recruitment is updated
  cache.clear(`player-recruitment:${playerId}`)
  cache.clear('player-recruitment:list')
  
  return response.data
}

export const deletePlayerRecruitment = async (playerId: string): Promise<void> => {
  await client.delete(`/player-recruitment/admin/applications/${playerId}`)
  
  // Invalidate caches when recruitment is deleted
  cache.clear(`player-recruitment:${playerId}`)
  cache.clear('player-recruitment:list')
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
