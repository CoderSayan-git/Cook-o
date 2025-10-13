const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  getUserStats, 
  getRecipeCount, 
  getUserPreferences, 
  updateUserPreferences,
  deleteAccount 
} = require('../controllers/userController');

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticate, getUserStats);

// @route   GET /api/users/recipes/count
// @desc    Get user's recipe count
// @access  Private
router.get('/recipes/count', authenticate, getRecipeCount);

// @route   GET /api/users/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', authenticate, getUserPreferences);

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticate, updateUserPreferences);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticate, deleteAccount);

module.exports = router;