# Cook'o - AI-Powered Recipe Generator 🍳

A modern, full-stack recipe generator application powered by advanced AI. Transform any ingredient or craving into delicious, personalized recipes instantly. Built with React + Vite for the frontend and Node.js + Express for the backend.

## ✨ Features

- **🎯 Direct Recipe Mode**: Ask for any recipe by name with customizable servings
- **🥘 Ingredients-based Mode**: Generate recipes from available ingredients
- **👤 User Authentication**: Secure signup/signin with JWT tokens
- **📱 Recipe Management**: Save, favorite, and organize your generated recipes
- **👨‍🍳 User Profiles**: Track your cooking journey and recipe history
- **🎨 Modern UI/UX**: Beautiful teal-themed design with glassmorphism effects
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🚀 Real-time Generation**: Powered by Google Gemini AI for intelligent recipe suggestions
- **🔍 Recipe Search**: Search through your saved recipes and ingredients

## 🏗️ Project Structure

```
Cook-o/
├── frontend/                    # React + Vite frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx     # Navigation component
│   │   │   ├── Footer.jsx     # Footer component
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/          # React Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/             # Main application pages
│   │   │   ├── HomePage.jsx   # Landing & recipe generation
│   │   │   ├── SignInPage.jsx # User authentication
│   │   │   ├── SignUpPage.jsx # User registration
│   │   │   ├── ProfilePage.jsx # User profile management
│   │   │   └── RecipesPage.jsx # Recipe collection
│   │   ├── App.jsx            # Main React component
│   │   └── index.css          # Global styles
│   └── package.json
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/           # Database & app configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth & validation middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   └── utils/           # Utility functions
│   ├── server.js            # Main server entry point
│   └── package.json
└── README.md                # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**
- **MongoDB** (local installation or MongoDB Atlas)
- **Google Gemini API key** 

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CoderSayan-git/Cook-o.git
   cd Cook-o
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables:**
   
   **Backend** - Create `.env` file in the `backend/` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/cooker-ai
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cooker-ai
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
   JWT_EXPIRES_IN=7d
   
   # Google Gemini AI
   GEMINI_API_KEY=your_google_gemini_api_key_here
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```
   
   **Frontend** - Create `.env` file in the `frontend/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development servers:**
   ```bash
   # Start backend (from backend directory)
   cd backend
   npm run dev
   
   # Start frontend (from frontend directory)
   cd frontend
   npm run dev
   ```
   
   
## 📝 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend development server
- `npm run dev:backend` - Start only the backend server
- `npm run build` - Build the frontend for production
- `npm run install:all` - Install dependencies for all projects
- `npm run clean` - Clean all node_modules and build files

## 🔧 Configuration

### Frontend Configuration

The frontend runs on **port 5173** by default (Vite's default). It's configured to proxy API requests to the backend on port 3000.

### Backend Configuration

The backend runs on **port 3000** by default. Key features:
- CORS enabled for frontend development
- Request logging
- Health check endpoint: `/health`
- Main API endpoint: `/generate`


## 🌐 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### POST `/api/auth/signin`
Sign in an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Recipe Endpoints

#### POST `/api/recipes/generate`
Generate a recipe based on user input. (Requires Authentication)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "type": "direct",
  "prompt": "pasta carbonara",
  "servings": 4
}
```

or

```json
{
  "type": "ingredients",
  "ingredients": ["chicken", "rice", "vegetables"]
}
```

#### GET `/api/recipes`
Get user's saved recipes. (Requires Authentication)

#### DELETE `/api/recipes/:id`
Delete a specific recipe. (Requires Authentication)

#### PUT `/api/recipes/:id/favorite`
Toggle recipe favorite status. (Requires Authentication)

## 🎨 UI Features

- **Modern Gradient Design**: Beautiful gradient backgrounds and button styles
- **Responsive Layout**: Works seamlessly on all device sizes
- **Smooth Animations**: Loading spinners, hover effects, and transitions
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Real-time Feedback**: Loading states and error handling


### Required Environment Variables

**Backend (.env):**
```env
# Essential Configuration
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
JWT_SECRET=your_256_bit_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=https://your-frontend-domain.com

# Optional Configuration
BCRYPT_SALT_ROUNDS=12
MAX_RECIPE_LENGTH=10000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=https://your-backend-api-url.com
```

## 🛠️ Development

### Adding New Features

1. **Frontend**: Add new React components in `frontend/src/components/`
2. **Backend**: Add new routes in `backend/server.js` or create separate route files
3. **Styling**: Update `frontend/src/App.css` for new styles

### Code Structure

- **Frontend**: Uses functional React components with hooks
- **Backend**: Express.js with modern ES6+ syntax
- **Styling**: Custom CSS with modern features (gradients, animations, flexbox)

## 📱 Responsive Design

The app is fully responsive with breakpoints for:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request


## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**:
   - Ensure MongoDB is running locally or check Atlas connection string
   - Verify network access and firewall settings

2. **JWT Token Errors**:
   - Check JWT_SECRET is set in environment variables
   - Ensure token hasn't expired

3. **API CORS Errors**:
   - Verify FRONTEND_URL matches your frontend domain
   - Check CORS middleware configuration

4. **Gemini API Errors**:
   - Validate GEMINI_API_KEY is correct
   - Check API quota and usage limits

### Performance Optimization

- Use MongoDB indexes for frequently queried fields
- Implement Redis caching for repeated API calls
- Configure CDN for static assets
- Enable gzip compression
- Use environment-specific configurations

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**


## 📊 Tech Stack

**Frontend:**
- React 18 with Hooks
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- React Router for navigation

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Google Gemini AI API

**DevOps & Deployment:**
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)
- GitHub Actions (CI/CD)


## 👨‍💻 Author

**Sayan Dhara** ([@CoderSayan-git](https://github.com/CoderSayan-git))

Made with ❤️ for food lovers and cooking enthusiasts worldwide.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful recipe generation
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- Open source community for inspiration and tools

---

**⭐ If you found this project helpful, please give it a star on GitHub!**

*Happy Cooking! 🍳✨*