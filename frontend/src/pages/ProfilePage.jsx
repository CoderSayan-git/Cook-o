import { useState, useEffect } from 'react'
import { User, Mail, Calendar, ChefHat, Heart, Camera, Edit2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingPicture, setIsUploadingPicture] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    bio: '',
    favoritesCuisine: ''
  })

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || 'Passionate home cook who loves experimenting with AI-generated recipes.',
        favoritesCuisine: user.favoritesCuisine || 'Italian, Asian, Mediterranean'
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    const result = await updateProfile(editData)
    if (result.success) {
      setIsEditing(false)
    } else {
      // Handle error - could show a toast notification
      console.error('Failed to update profile:', result.error)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user.name || '',
      email: user.email || '',
      bio: user.bio || '',
      favoritesCuisine: user.favoritesCuisine || ''
    })
    setIsEditing(false)
  }

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    })
  }

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploadingPicture(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target.result
        
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/profile/picture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profilePicture: base64 })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to upload profile picture')
        }

        const data = await response.json()
        // Update user data in context
        await updateProfile(data.data.user)
        setIsUploadingPicture(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Profile picture upload error:', error)
      alert('Failed to upload profile picture: ' + error.message)
      setIsUploadingPicture(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/profile/picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to remove profile picture')
      }

      const data = await response.json()
      // Update user data in context
      await updateProfile(data.data.user)
    } catch (error) {
      console.error('Remove profile picture error:', error)
      alert('Failed to remove profile picture: ' + error.message)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900/50 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="mx-auto mb-4 text-blue-400 animate-bounce" size={48} />
          <p className="text-gray-400">Please sign in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900/50 backdrop-blur-sm py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-3xl p-8 border border-dark-700/50 shadow-dark-lg mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-dark-lg overflow-hidden">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              {isEditing && (
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <input
                    type="file"
                    id="profile-picture-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                  <button 
                    onClick={() => document.getElementById('profile-picture-upload').click()}
                    disabled={isUploadingPicture}
                    className="p-2 bg-dark-700 hover:bg-dark-600 rounded-full border border-dark-600 transition-all duration-200 disabled:opacity-50"
                    title="Upload profile picture"
                  >
                    {isUploadingPicture ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-4 h-4 text-gray-300" />
                    )}
                  </button>
                  {user.profilePicture && (
                    <button 
                      onClick={handleRemoveProfilePicture}
                      className="p-2 bg-red-700 hover:bg-red-600 rounded-full border border-red-600 transition-all duration-200"
                      title="Remove profile picture"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="text-2xl font-bold bg-dark-700/50 text-white border border-dark-600 rounded-xl px-4 py-2 w-full focus:border-blue-500 outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    className="block bg-dark-700/50 text-gray-300 border border-dark-600 rounded-xl px-4 py-2 w-full focus:border-blue-500 outline-none"
                  />
                  <textarea
                    name="bio"
                    value={editData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="block bg-dark-700/50 text-gray-300 border border-dark-600 rounded-xl px-4 py-2 w-full resize-none focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    name="favoritesCuisine"
                    value={editData.favoritesCuisine}
                    onChange={handleChange}
                    placeholder="Favorite cuisines"
                    className="block bg-dark-700/50 text-gray-300 border border-dark-600 rounded-xl px-4 py-2 w-full focus:border-blue-500 outline-none"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-200 font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 bg-dark-700 text-gray-300 rounded-xl hover:bg-dark-600 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                    <button
                      onClick={handleEdit}
                      className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg border border-dark-600 transition-all duration-200"
                    >
                      <Edit2 className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <p className="text-gray-300 mb-4 w-full">{user.bio}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400 mb-4">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Loves: {user.favoritesCuisine}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined {user.joinDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl p-6 border border-dark-700/50 shadow-dark text-center">
            <ChefHat className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">{user.recipesGenerated}</h3>
            <p className="text-gray-400">Recipes Generated</p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl p-6 border border-dark-700/50 shadow-dark text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">{user.favoriteRecipes}</h3>
            <p className="text-gray-400">Favorite Recipes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage