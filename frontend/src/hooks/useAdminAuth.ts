import { useState } from 'react'
import { login as apiLogin } from '../api/auth'
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

  function logout() {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/login'
  }

  return { isAuthenticated, login, logout, loading, error }
}
