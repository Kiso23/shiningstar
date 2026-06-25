import { useState } from 'react'
import { login as apiLogin, logout as apiLogout } from '../api/auth'
import { extractErrorMessage } from '../api/errors'

export function useAdminAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!localStorage.getItem('admin_token')

  async function login(email: string, password: string): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await apiLogin(email, password)
      localStorage.setItem('admin_token', res.access_token)
      return true
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password'))
      return false
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    setError(null)
    try {
      // Call backend logout to blacklist token
      await apiLogout()
    } catch (err) {
      console.error('Logout error:', err)
      // Clear token locally even if backend call fails
    } finally {
      // Always clear local token and redirect
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
  }

  return { isAuthenticated, login, logout, loading, error }
}
