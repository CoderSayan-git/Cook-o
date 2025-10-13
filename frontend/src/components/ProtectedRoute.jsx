import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900/50 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to sign in page with return url
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute