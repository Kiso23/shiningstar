import client from './client'

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
  return response.data
}

// Admin endpoints
export const listContacts = async (
  skip: number = 0,
  limit: number = 50,
  statusFilter?: string
): Promise<ContactResponse[]> => {
  const params = new URLSearchParams()
  params.append('skip', skip.toString())
  params.append('limit', limit.toString())
  if (statusFilter) params.append('status_filter', statusFilter)

  const response = await client.get(`/contact/admin/contacts?${params}`)
  return response.data
}

export const getContact = async (contactId: string): Promise<ContactResponse> => {
  const response = await client.get(`/contact/admin/contacts/${contactId}`)
  return response.data
}

export const replyToContact = async (
  contactId: string,
  replyData: ContactReply
): Promise<ContactResponse> => {
  const response = await client.patch(`/contact/admin/contacts/${contactId}/reply`, replyData)
  return response.data
}

export const updateContactStatus = async (
  contactId: string,
  status: string
): Promise<ContactResponse> => {
  const response = await client.patch(`/contact/admin/contacts/${contactId}/status`, { status })
  return response.data
}

export const deleteContact = async (contactId: string): Promise<void> => {
  await client.delete(`/contact/admin/contacts/${contactId}`)
}

export const getContactsCount = async (statusFilter?: string): Promise<{ count: number }> => {
  const params = new URLSearchParams()
  if (statusFilter) params.append('status_filter', statusFilter)

  const response = await client.get(`/contact/admin/contacts-count?${params}`)
  return response.data
}
