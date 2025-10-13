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

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The server will start on http://localhost:5000

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- Input validation and sanitization
- MongoDB injection protection

## 📊 Database Models

### User Model
- Personal information (name, email, bio)
- Authentication (hashed password)
- Recipe statistics
- Favorite cuisines
- Account status and timestamps

### Recipe Model
- AI-generated recipe content
- User associations
- Categories and tags
- Favorite status
- Generation prompts and metadata

## 🔧 Middleware Stack
1. **Security**: Helmet for security headers
2. **CORS**: Cross-origin resource sharing
3. **Rate Limiting**: Prevent API abuse
4. **Compression**: Response compression
5. **Logging**: Morgan HTTP request logging
6. **Body Parsing**: JSON and URL-encoded data
7. **Authentication**: JWT token verification
8. **Validation**: Input validation and sanitization

## 📈 API Response Format
All API responses follow a consistent format:
```json
{
  "success": true/false,
  "message": "Description of the result",
  "data": { ... }, // Only present on successful requests
  "errors": [ ... ] // Only present on validation errors
}
```

## 🛡️ Error Handling
- Global error handler for consistent error responses
- Specific handling for validation errors, JWT errors, and MongoDB errors
- Proper HTTP status codes
- Development vs production error details

## 🔄 Development Workflow
1. Make changes to source files
2. Nodemon automatically restarts the server
3. Test endpoints using the health check: http://localhost:5000/health
4. Use the API documentation for testing specific endpoints

## 📝 API Testing
Use tools like:
- Postman
- Insomnia
- curl commands
- Frontend application integration

## 🚦 Production Considerations
- Set `NODE_ENV=production`
- Use environment-specific MongoDB connection
- Configure proper CORS origins
- Set up proper logging
- Use PM2 or similar for process management
- Set up MongoDB Atlas or proper database hosting
- Configure proper rate limiting values