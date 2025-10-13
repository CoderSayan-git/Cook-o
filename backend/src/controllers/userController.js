const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's recipe count
    const recipeCount = await Recipe.countDocuments({ user: userId });
    
    // Get user's favorite recipes count
    const favoriteCount = await Recipe.countDocuments({ 
      user: userId, 
      isFavorite: true 
    });

    // Get recent recipes (last 5)
    const recentRecipes = await Recipe.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt');

    // Calculate user ranking (based on recipes generated)
    const usersWithMoreRecipes = await User.countDocuments({
      recipesGenerated: { $gt: req.user.recipesGenerated }
    });
    const totalUsers = await User.countDocuments();
    const userRank = usersWithMoreRecipes + 1;

    const stats = {
      recipesGenerated: recipeCount,
      favoriteRecipes: favoriteCount,
      userRank,
      totalUsers,
      joinDate: req.user.createdAt,
      recentRecipes,
      achievements: generateAchievements(recipeCount, favoriteCount)
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's recipe count
const getRecipeCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Recipe.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        count
      }
    });

  } catch (error) {
    console.error('Get recipe count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recipe count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user preferences
const getUserPreferences = async (req, res) => {
  try {
    const user = req.user;
    
    const preferences = {
      favoritesCuisine: user.favoritesCuisine,
      dietaryRestrictions: user.dietaryRestrictions || 'None',
      skillLevel: user.skillLevel || 'Intermediate',
      preferredCookingTime: user.preferredCookingTime || '30-45 minutes'
    };

    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user preferences
const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      favoritesCuisine, 
      dietaryRestrictions, 
      skillLevel, 
      preferredCookingTime 
    } = req.body;

    const updates = {};
    if (favoritesCuisine !== undefined) updates.favoritesCuisine = favoritesCuisine;
    if (dietaryRestrictions !== undefined) updates.dietaryRestrictions = dietaryRestrictions;
    if (skillLevel !== undefined) updates.skillLevel = skillLevel;
    if (preferredCookingTime !== undefined) updates.preferredCookingTime = preferredCookingTime;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    // Verify password before deletion
    const user = await User.findById(userId).select('+password');
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Delete user's recipes
    await Recipe.deleteMany({ user: userId });
    
    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to generate achievements
const generateAchievements = (recipeCount, favoriteCount) => {
  const achievements = [];

  // Recipe generation achievements
  if (recipeCount >= 1) achievements.push({ name: 'First Recipe', description: 'Generated your first recipe!' });
  if (recipeCount >= 10) achievements.push({ name: 'Chef in Training', description: 'Generated 10 recipes!' });
  if (recipeCount >= 50) achievements.push({ name: 'Master Chef', description: 'Generated 50 recipes!' });
  if (recipeCount >= 100) achievements.push({ name: 'Recipe Master', description: 'Generated 100 recipes!' });

  // Favorite achievements
  if (favoriteCount >= 5) achievements.push({ name: 'Taste Maker', description: 'Favorited 5 recipes!' });
  if (favoriteCount >= 20) achievements.push({ name: 'Connoisseur', description: 'Favorited 20 recipes!' });

  return achievements;
};

module.exports = {
  getUserStats,
  getRecipeCount,
  getUserPreferences,
  updateUserPreferences,
  deleteAccount
};