import client from './client'

export interface TokenResponse {
  access_token: string
  token_type: string
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await client.post('/auth/login', { email, password })
  return res.data
}

export async function logout(): Promise<{ message: string }> {
  const res = await client.post('/auth/logout', {})
  // Clear token from localStorage on successful logout
  localStorage.removeItem('token')
  return res.data
}

export async function getMe(): Promise<{ email: string }> {
  const res = await client.get('/auth/me')
  return res.data
}
