const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: 'Passionate home cook who loves experimenting with AI-generated recipes.'
  },
  favoritesCuisine: {
    type: String,
    maxlength: [200, 'Favorite cuisines cannot exceed 200 characters'],
    default: 'Italian, Asian, Mediterranean'
  },
  profilePicture: {
    type: String, // Store as base64 string or file path
    default: null
  },
  recipesGenerated: {
    type: Number,
    default: 0,
    min: [0, 'Recipes generated cannot be negative']
  },
  favoriteRecipes: {
    type: Number,
    default: 0,
    min: [0, 'Favorite recipes cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for join date formatting
userSchema.virtual('joinDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
});

// Index for better query performance (email index is already created by unique: true)
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment recipe count
userSchema.methods.incrementRecipeCount = async function() {
  this.recipesGenerated += 1;
  return await this.save();
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Static method to get user stats
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { 
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
        },
        totalRecipesGenerated: { $sum: '$recipesGenerated' },
        avgRecipesPerUser: { $avg: '$recipesGenerated' }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    totalRecipesGenerated: 0,
    avgRecipesPerUser: 0
  };
};

module.exports = mongoose.model('User', userSchema);