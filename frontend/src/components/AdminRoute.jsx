import { Navigate, Outlet } from 'react-router-dom'
import { getToken, isAdmin } from '../utils/auth'

export function AdminRoute() {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
