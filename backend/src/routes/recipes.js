const express = require('express');
const router = express.Router();
const {
  generateRecipe,
  getUserRecipes,
  getRecipe,
  toggleFavorite,
  deleteRecipe,
  generateRecipeValidation
} = require('../controllers/recipeController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// @route   POST /api/recipes/generate
// @desc    Generate a new recipe using AI
// @access  Public (but saves to user if authenticated)
router.post(
  '/generate',
  optionalAuth,
  generateRecipeValidation,
  handleValidationErrors,
  generateRecipe
);

// @route   GET /api/recipes
// @desc    Get user's recipes with pagination and filtering
// @access  Private
router.get('/', authenticate, getUserRecipes);

// @route   GET /api/recipes/:id
// @desc    Get a specific recipe
// @access  Private
router.get('/:id', authenticate, getRecipe);

// @route   PUT /api/recipes/:id/favorite
// @desc    Toggle recipe favorite status
// @access  Private
router.put('/:id/favorite', authenticate, toggleFavorite);

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/:id', authenticate, deleteRecipe);

module.exports = router;