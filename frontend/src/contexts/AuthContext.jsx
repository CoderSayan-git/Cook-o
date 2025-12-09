import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// API base URL with debugging
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`

// Debug logging
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL,
  MODE: import.meta.env.MODE
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to make API calls with authentication
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  const url = `${API_BASE_URL}${endpoint}`
  
  //  JSON formatting
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  }

  console.log('Making API call:', { url, method: config.method || 'GET', headers: config.headers })

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const data = await response.json()
        errorMessage = data.message || errorMessage
      } catch (parseError) {
        console.error('Error parsing response JSON:', parseError)
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API call failed:', { url, error: error.message, stack: error.stack })
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if the backend is running.`)
    }
    
    throw error
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Verify token and get user profile
          const response = await apiCall('/auth/profile')
          setUser(response.data.user)
        } catch (error) {
          console.error('Error verifying token:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const signIn = async (email, password) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      const { user: userData, token } = response.data
      setUser(userData)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  const signUp = async (userData) => {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      const { user: newUser, token } = response.data
      setUser(newUser)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateProfile = async (updatedData) => {
    try {
      // If updatedData is a full user object (from profile picture upload), use it directly
      if (updatedData && updatedData._id) {
        setUser(updatedData)
        localStorage.setItem('user', JSON.stringify(updatedData))
        return { success: true }
      }

      // Otherwise, make API call to update profile
      const response = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      })

      const updatedUser = response.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  const incrementRecipeCount = async () => {
    if (user) {
      try {
        // The backend automatically increments recipe count when generating recipes
        // But we can also call this endpoint for manual updates
        await apiCall('/users/recipes/count')
        
        // Update local user state
        const updatedUser = {
          ...user,
          recipesGenerated: (user.recipesGenerated || 0) + 1
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } catch (error) {
        console.error('Error updating recipe count:', error)
      }
    }
  }

  const addActivity = (type, description) => {
    if (user) {
      const now = new Date()
      const timeAgo = getTimeAgo(now)
      
      const newActivity = {
        type,
        description,
        timestamp: timeAgo,
        createdAt: now.toISOString()
      }

      const activities = user.recentActivities || []
      const updatedActivities = [newActivity, ...activities].slice(0, 10) // Keep only last 10 activities

      const updatedUser = {
        ...user,
        recentActivities: updatedActivities
      }
      
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInMs = now - date
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    incrementRecipeCount,
    addActivity,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext