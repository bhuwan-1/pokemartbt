import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/auth-context'

// Cosmetic route guard (UX only). The real access control is RLS — never rely on this.
export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
