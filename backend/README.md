# Recipe Generator Backend API

## 🚀 Project Overview
Professional backend API for the Recipe Generator application with MongoDB integration, JWT authentication, and organized file structure.

## 📁 Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic (register, login, profile)
│   │   ├── recipeController.js   # Recipe generation and management
│   │   └── userController.js     # User profile management
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── rateLimiter.js       # Rate limiting configuration
│   │   └── validation.js        # Input validation middleware
│   ├── models/
│   │   ├── User.js              # User schema with authentication
│   │   └── Recipe.js            # Recipe schema with AI integration
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── recipes.js           # Recipe management routes
│   │   └── users.js             # User management routes
│   └── utils/
│       └── jwt.js               # JWT token utilities
├── .env.example                 # Environment variables template
├── .env                         # Environment variables (create from .env.example)
├── server.js                    # Main application server
└── package.json                 # Dependencies and scripts
```

## 🛠️ Technologies Used
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **AI Integration**: Google Gemini API
- **Development**: Nodemon for auto-restart

## 📦 Dependencies
### Production Dependencies
- express: Web framework
- mongoose: MongoDB ODM
- bcryptjs: Password hashing
- jsonwebtoken: JWT token handling
- dotenv: Environment variables
- cors: Cross-origin resource sharing
- helmet: Security headers
- morgan: HTTP request logging
- compression: Response compression
- express-rate-limit: Rate limiting
- express-validator: Input validation
- @google/generative-ai: Google Gemini AI

### Development Dependencies
- nodemon: Development server auto-restart

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)

### Recipe Routes (`/api/recipes`)
- `POST /generate` - Generate AI recipe (protected)
- `GET /` - Get user's recipes (protected)
- `GET /:id` - Get specific recipe (protected)
- `POST /:id/favorite` - Toggle recipe favorite (protected)
- `DELETE /:id` - Delete recipe (protected)

### User Routes (`/api/users`)
- `GET /stats` - Get user statistics (protected)
- `GET /recipes/count` - Get user's recipe count (protected)

### Health Check
- `GET /health` - Server health status

## 🔧 Environment Variables
Create a `.env` file based on `.env.example`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cooker-app
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-google-gemini-api-key-here
NODE_ENV=development
```

