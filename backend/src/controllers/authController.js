const User = require('../models/User');
const { generateTokenForUser } = require('../utils/jwt');
const { body } = require('express-validator');

// Validation rules for registration
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateTokenForUser(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateTokenForUser(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, favoritesCuisine } = req.body;

    // Validate input
    const updates = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (favoritesCuisine !== undefined) updates.favoritesCuisine = favoritesCuisine.trim();

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture data is required'
      });
    }

    // Validate base64 image data
    const base64Pattern = /^data:image\/(jpeg|jpg|png|webp);base64,/;
    if (!base64Pattern.test(profilePicture)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Only JPEG, PNG, and WebP are supported.'
      });
    }

    // Check file size (approximate from base64)
    const base64Data = profilePicture.replace(/^data:image\/[a-z]+;base64,/, '');
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (sizeInBytes > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Image size too large. Maximum size is 5MB.'
      });
    }

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Remove profile picture
const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: null },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout user (client-side token removal)
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  logout,
  registerValidation,
  loginValidation
};