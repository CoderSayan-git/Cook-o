import { ChefHat, Sparkles, Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()

  const handleSignOut = () => {
    signOut()
    setIsMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#14532D]/70 backdrop-blur-xl border-b border-dark-700/50 shadow-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg overflow-hidden">
              <img 
                src="/logo1.png" 
                alt="Cook'o Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-none">COOK'o</span>
              <span className="text-blue-400 text-xs font-medium">Food Master</span>
            </div>
          </Link>

          {/* Desktop Navigation - Removed for cleaner look when logged in */}

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Auth Buttons */}
            {user ? (
              <div className="relative">
                {/* Profile Dropdown Button */}
                <button
                  onClick={toggleProfileDropdown}
                  className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-dark-800/95 hover:bg-dark-700/95 text-white font-medium rounded-lg transition-all duration-200 border border-dark-600"
                  style={{ backgroundColor: 'rgba(31, 41, 55, 0.95)' }}
                >
                  {/* Profile Picture or Icon */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span>{user.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800/95 backdrop-blur-xl rounded-lg shadow-dark-lg border border-dark-600 py-2 z-50" style={{ backgroundColor: 'rgba(31, 41, 55, 0.95)' }}>
                    <Link 
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-700 transition-colors duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link 
                      to="/recipes"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-700 transition-colors duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>My Recipes</span>
                    </Link>
                    <hr className="border-dark-600 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700 transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link 
                  to="/signin"
                  className="px-4 py-2 text-gray-300 hover:text-white font-medium rounded-lg transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg bg-dark-800/95 hover:bg-dark-700/95 text-gray-300 hover:text-white transition-all duration-200 border border-dark-600"
              style={{ backgroundColor: 'rgba(31, 41, 55, 0.95)' }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-dark-700/50 py-4 animate-pulse-slow">
            <div className="flex flex-col space-y-3">
              {user && (
                <>
                  {/* User info for mobile */}
                  <div className="flex items-center space-x-3 px-3 py-2 bg-dark-800/95 rounded-lg" style={{ backgroundColor: 'rgba(31, 41, 55, 0.95)' }}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-gray-300 hover:text-white hover:bg-dark-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/recipes" 
                    className="flex items-center space-x-2 font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-gray-300 hover:text-white hover:bg-dark-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>My Recipes</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-dark-800 font-medium rounded-lg transition-colors duration-200 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link 
                    to="/signin"
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-dark-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 mt-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar