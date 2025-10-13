# Recipe Generator App 🍳

A modern, full-stack recipe generator application powered by Google's Gemini AI. Built with React + Vite for the frontend and Node.js + Express for the backend.

## ✨ Features

- **Dual Recipe Generation Modes:**
  - 🎯 **Direct Recipe**: Ask for any recipe by name
  - 🥘 **Ingredients-based**: Generate recipes from available ingredients
- **Modern UI/UX**: Beautiful, responsive design with gradient backgrounds and smooth animations
- **Real-time Generation**: Powered by Google Gemini AI for intelligent recipe suggestions
- **Cross-platform**: Works on desktop and mobile devices

## 🏗️ Project Structure

```
recipe-generator-app/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx    # Main React component
│   │   ├── App.css    # Modern styling
│   │   └── ...
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── server.js      # API server with Gemini integration
│   ├── .env.local     # Environment variables (not in repo)
│   └── package.json
└── package.json       # Root package with scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd recipe-generator-app
   npm run install:all
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This starts both:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

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

## 🌐 API Endpoints

### POST `/generate`

Generate a recipe based on user input.

**Request Body:**
```json
{
  "type": "direct",
  "prompt": "pasta carbonara"
}
```

or

```json
{
  "type": "ingredients",
  "ingredients": ["chicken", "rice", "vegetables"]
}
```

**Response:**
```json
{
  "text": "Generated recipe content..."
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "OK", 
  "message": "Recipe Generator API is running!"
}
```

## 🎨 UI Features

- **Modern Gradient Design**: Beautiful gradient backgrounds and button styles
- **Responsive Layout**: Works seamlessly on all device sizes
- **Smooth Animations**: Loading spinners, hover effects, and transitions
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Real-time Feedback**: Loading states and error handling

## 🔑 Environment Variables

Create a `.env.local` file in the `backend/` directory with:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=3000  # Optional, defaults to 3000
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

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

**Sayan Dhara** - Made with ❤️

---

*Happy Cooking! 🍳✨*