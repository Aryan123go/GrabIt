import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return children
}

export default PublicRoute
