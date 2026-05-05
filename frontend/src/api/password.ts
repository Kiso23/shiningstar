import client from './client'

export async function forgotPassword(email: string): Promise<void> {
  await client.post('/auth/forgot-password', { email })
}

export async function verifyOTP(email: string, code: string): Promise<void> {
  await client.post('/auth/verify-otp', { email, code })
}

export async function resetPassword(email: string, code: string, new_password: string): Promise<void> {
  await client.post('/auth/reset-password', { email, code, new_password })
}

export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await client.post('/auth/change-password', { current_password, new_password })
}
