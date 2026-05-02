import client from './client'
import type { TeamResponse } from './registrations'

export interface TeamDetail extends TeamResponse {
  id: string
  logo_path?: string
  updated_at: string
  players: { id: string; full_name: string; age: number; jersey_number: number; position: string; position_index: number }[]
  payment_proof?: {
    id: string
    original_filename: string
    mime_type: string
    file_size_bytes: number
    uploaded_at: string
  }
}

export interface PaginatedTeamList {
  items: TeamResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ListParams {
  page?: number
  page_size?: number
  status?: string
  search?: string
}

export async function listRegistrations(params: ListParams = {}): Promise<PaginatedTeamList> {
  const res = await client.get('/admin/registrations', { params })
  return res.data
}

export async function getRegistrationDetail(registrationId: string): Promise<TeamDetail> {
  const res = await client.get(`/admin/registrations/${registrationId}`)
  return res.data
}

export async function updateStatus(
  registrationId: string,
  status: string
): Promise<TeamResponse> {
  const res = await client.patch(`/admin/registrations/${registrationId}/status`, { status })
  return res.data
}

export function getPaymentProofUrl(registrationId: string): string {
  const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  return `${base}/admin/registrations/${registrationId}/payment-proof`
}

export function getExportUrl(format: 'csv' | 'xlsx'): string {
  const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  const token = localStorage.getItem('admin_token') || ''
  return `${base}/admin/export?format=${format}&token=${token}`
}

export async function deleteRegistration(registrationId: string): Promise<void> {
  await client.delete(`/admin/registrations/${registrationId}`)
}
