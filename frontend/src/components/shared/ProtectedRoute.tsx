import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('admin_token')
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}
