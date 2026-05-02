import client from './client'

export interface TokenResponse {
  access_token: string
  token_type: string
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await client.post('/auth/login', { email, password })
  return res.data
}
