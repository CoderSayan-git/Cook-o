const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [200, 'Recipe title cannot exceed 200 characters']
  },
  ingredients: [{
    type: String,
    required: true,
    trim: true
  }],
  instructions: {
    type: String,
    required: [true, 'Recipe instructions are required']
  },
  cookingTime: {
    type: String,
    trim: true
  },
  servings: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  cuisine: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage']
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  promptType: {
    type: String,
    enum: ['direct', 'ingredients'],
    required: true
  },
  originalPrompt: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted creation date
recipeSchema.virtual('createdAtFormatted').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Indexes for better query performance
recipeSchema.index({ user: 1, createdAt: -1 });
recipeSchema.index({ user: 1, isFavorite: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ category: 1 });

// Instance method to toggle favorite status
recipeSchema.methods.toggleFavorite = async function() {
  this.isFavorite = !this.isFavorite;
  return await this.save();
};

// Static method to get user's recipe stats
recipeSchema.statics.getUserRecipeStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalRecipes: { $sum: 1 },
        favoriteRecipes: { 
          $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] } 
        },
        cuisineBreakdown: {
          $push: '$cuisine'
        },
        categoryBreakdown: {
          $push: '$category'
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalRecipes: 0,
    favoriteRecipes: 0,
    cuisineBreakdown: [],
    categoryBreakdown: []
  };
};

module.exports = mongoose.model('Recipe', recipeSchema);