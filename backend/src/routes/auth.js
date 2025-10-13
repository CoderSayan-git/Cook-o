const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  logout,
  registerValidation,
  loginValidation
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  login
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, updateProfile);

// @route   POST /api/auth/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile/picture', authenticate, uploadProfilePicture);

// @route   DELETE /api/auth/profile/picture
// @desc    Remove profile picture
// @access  Private
router.delete('/profile/picture', authenticate, removeProfilePicture);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logout);

module.exports = router;