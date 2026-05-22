import client from './client'
import { cache, CACHE_TTL, cacheKeys } from '../utils/cache'

export interface ContactCreate {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export interface ContactResponse extends ContactCreate {
  id: string
  status: 'new' | 'read' | 'responded' | 'closed'
  admin_reply?: string
  created_at: string
  updated_at: string
}

export interface ContactReply {
  status: 'read' | 'responded' | 'closed'
  admin_reply: string
}

// Public endpoint - submit contact form
export const submitContact = async (data: ContactCreate): Promise<ContactResponse> => {
  const response = await client.post('/contact', data)
  // Clear contacts cache when new contact is submitted
  cache.clear(cacheKeys.contacts())
  return response.data
}

// Admin endpoints
export const listContacts = async (
  skip: number = 0,
  limit: number = 50,
  statusFilter?: string
): Promise<ContactResponse[]> => {
  const cacheKey = cacheKeys.contacts(statusFilter)
  
  // Check cache first
  const cached = cache.get<ContactResponse[]>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams()
  params.append('skip', skip.toString())
  params.append('limit', limit.toString())
  if (statusFilter) params.append('status_filter', statusFilter)

  const response = await client.get(`/contact/admin/contacts?${params}`)
  
  // Cache the result for 5 minutes
  cache.set(cacheKey, response.data, CACHE_TTL.MEDIUM)
  
  return response.data
}

export const getContact = async (contactId: string): Promise<ContactResponse> => {
  const cacheKey = cacheKeys.contact(contactId)
  
  // Check cache first
  const cached = cache.get<ContactResponse>(cacheKey)
  if (cached) return cached

  const response = await client.get(`/contact/admin/contacts/${contactId}`)
  
  // Cache the result for 5 minutes
  cache.set(cacheKey, response.data, CACHE_TTL.MEDIUM)
  
  return response.data
}

export const replyToContact = async (
  contactId: string,
  replyData: ContactReply
): Promise<ContactResponse> => {
  const response = await client.patch(`/contact/admin/contacts/${contactId}/reply`, replyData)
  
  // Invalidate caches when contact is updated
  cache.clear(cacheKeys.contact(contactId))
  cache.clear(cacheKeys.contacts())
  cache.clear(cacheKeys.contactsCount())
  
  return response.data
}

export const updateContactStatus = async (
  contactId: string,
  status: string
): Promise<ContactResponse> => {
  const response = await client.patch(`/contact/admin/contacts/${contactId}/status`, { status })
  
  // Invalidate caches when contact is updated
  cache.clear(cacheKeys.contact(contactId))
  cache.clear(cacheKeys.contacts())
  cache.clear(cacheKeys.contactsCount())
  
  return response.data
}

export const deleteContact = async (contactId: string): Promise<void> => {
  await client.delete(`/contact/admin/contacts/${contactId}`)
  
  // Invalidate caches when contact is deleted
  cache.clear(cacheKeys.contact(contactId))
  cache.clear(cacheKeys.contacts())
  cache.clear(cacheKeys.contactsCount())
}

export const getContactsCount = async (statusFilter?: string): Promise<{ count: number }> => {
  const cacheKey = cacheKeys.contactsCount(statusFilter)
  
  // Check cache first
  const cached = cache.get<{ count: number }>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams()
  if (statusFilter) params.append('status_filter', statusFilter)

  const response = await client.get(`/contact/admin/contacts-count?${params}`)
  
  // Cache the result for 5 minutes
  cache.set(cacheKey, response.data, CACHE_TTL.MEDIUM)
  
  return response.data
}
