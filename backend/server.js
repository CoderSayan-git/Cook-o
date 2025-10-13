require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const recipeRoutes = require('./src/routes/recipes');
const userRoutes = require('./src/routes/users');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_PRODUCTION,
    ].filter(Boolean); // Remove undefined values
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      // Allow any localhost origin
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Allow Vercel preview deployments
    if (origin && origin.includes('vercel.app')) {
      console.log(`Allowing Vercel origin: ${origin}`);
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Public app statistics endpoint for landing page
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./src/models/User');
    const Recipe = require('./src/models/Recipe');

    // Get basic app statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalRecipes = await Recipe.countDocuments();
    
    // Get average recipes per user
    const avgStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avgRecipesPerUser: { $avg: '$recipesGenerated' },
          totalRecipesGenerated: { $sum: '$recipesGenerated' }
        }
      }
    ]);

    const stats = {
      totalUsers,
      totalRecipes,
      avgRecipesPerUser: avgStats[0]?.avgRecipesPerUser || 0,
      totalRecipesGenerated: avgStats[0]?.totalRecipesGenerated || 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get app stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get app statistics'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

// Legacy route for backward compatibility with frontend
app.post('/generate', async (req, res) => {
  try {
    // Redirect to new API endpoint
    const newUrl = `${req.protocol}://${req.get('host')}/api/recipes/generate`;
    res.redirect(307, newUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Please use /api/recipes/generate endpoint'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: {
      auth: '/api/auth',
      recipes: '/api/recipes',
      users: '/api/users',
      health: '/health'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  // MongoDB connection error
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return res.status(500).json({
      success: false,
      message: 'Database connection error'
    });
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Recipe Generator API server running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🍳 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📖 API Documentation:`);
    console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
    console.log(`   - Recipes: http://localhost:${PORT}/api/recipes`);
    console.log(`   - Users: http://localhost:${PORT}/api/users`);
  }
});

module.exports = app;
