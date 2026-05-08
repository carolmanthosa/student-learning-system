import { Navigate } from 'react-router-dom'
import authService from '../services/authService'

interface Props {
  children: React.ReactNode
  adminOnly?: boolean
}

function PrivateRoute({ children, adminOnly = false }: Props) {
  if (!authService.isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !authService.isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default PrivateRoute