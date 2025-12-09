import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ChefHat, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const SignInPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      setIsLoading(false)
      return
    }

    const result = await signIn(email, password)
    
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Sign in failed')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-teal-900 backdrop-blur-sm flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-dark">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl leading-none">COOK'o</span>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-yellow-400 animate-sparkle" />
                <span className="text-blue-400 text-sm font-medium">Food Master</span>
                <Sparkles className="w-3 h-3 text-yellow-400 animate-sparkle" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-gray-300">Sign in to your account to continue cooking</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-cyan-800/50 backdrop-blur-xl rounded-3xl p-8 border border-dark-700/50 shadow-dark-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-dark-600 rounded-xl text-white bg-dark-700/50 backdrop-blur-sm transition-all duration-300 outline-none focus:border-blue-500 focus:shadow-dark placeholder:text-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-dark-600 rounded-xl text-white bg-dark-700/50 backdrop-blur-sm transition-all duration-300 outline-none focus:border-blue-500 focus:shadow-dark placeholder:text-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-dark-600 rounded bg-dark-700 accent-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 border-none rounded-xl text-lg font-semibold cursor-pointer transition-all duration-300 outline-none bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-dark hover:scale-105 hover:shadow-dark-lg hover:from-blue-600 hover:to-purple-700 active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Sign up link */}
            <div className="text-center">
              <span className="text-gray-300">Don't have an account? </span>
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}

export default SignInPage