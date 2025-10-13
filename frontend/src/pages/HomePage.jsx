import { useState } from 'react'
import { ChefHat, Sparkles, Loader2, Users, Clock, Heart, Zap, ArrowRight, Star, Plus, X, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const HomePage = () => {
  const [promptType, setPromptType] = useState('direct')
  const [directPrompt, setDirectPrompt] = useState('')
  const [servings, setServings] = useState(4)
  const [ingredients, setIngredients] = useState([])
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, incrementRecipeCount, addActivity } = useAuth()

  const convertMarkdownToHTML = (text) => {
    // First, handle markdown tables
    const processedText = text.replace(/(\|.*\|.*\n)+/g, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 2) return match;
      
      // Skip separator line (contains :--- or similar)
      const headerLine = lines[0];
      const dataLines = lines.slice(1).filter(line => !line.includes('---'));
      
      if (dataLines.length === 0) return match;
      
      // Parse header
      const headers = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell);
      
      // Parse data rows
      const rows = dataLines.map(line => 
        line.split('|').map(cell => cell.trim()).filter(cell => cell)
      );
      
      // Generate HTML table
      let tableHTML = '<table class="recipe-table mb-6">';
      
      if (headers.length > 0) {
        tableHTML += '<thead><tr>';
        headers.forEach(header => {
          tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead>';
      }
      
      tableHTML += '<tbody>';
      rows.forEach(row => {
        tableHTML += '<tr>';
        row.forEach(cell => {
          tableHTML += `<td>${cell}</td>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</tbody></table>';
      
      return tableHTML;
    });

    return processedText
      // Remove code block markers
      .replace(/```[\w]*\n?/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Handle horizontal rules
      .replace(/^---$/gim, '<hr class="my-6 border-gray-600">')
      // Handle headings with proper styling
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-blue-300 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mt-8 mb-6">$1</h1>')
      // Handle bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-300 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-gray-300 italic">$1</em>')
      // Handle line breaks and paragraphs
      .replace(/\n\n+/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph tags
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, '</p>')
      // Clean up empty paragraphs and fix table paragraphs
      .replace(/<p[^>]*><\/p>/g, '')
      .replace(/<p[^>]*><br><\/p>/g, '')
      .replace(/<p[^>]*>(<table.*?<\/table>)<\/p>/gs, '$1')
  }

  const handleSubmit = async () => {
    let requestBody = {}

    if (promptType === 'direct') {
      if (!directPrompt.trim()) {
        setResponse("Please enter name of the dish.")
        return
      }
      requestBody = { type: 'direct', prompt: directPrompt, servings: parseInt(servings) }
    } else {
      if (ingredients.length === 0) {
        setResponse("Please add at least one ingredient.")
        return
      }
      requestBody = { type: 'ingredients', ingredients: ingredients }
    }

    setIsLoading(true)
    setResponse('Generating recipe, please wait...')

    try {
      // Get token for authenticated requests
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json'
      }
      
      // Add authorization header if user is logged in
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/recipes/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResponse(data.data.text)
      
      // Recipe count is automatically incremented on the backend
      // Refresh user data if authenticated
      if (token) {
        incrementRecipeCount()
        
        // Add activity for recipe generation
        const recipeName = promptType === 'direct' ? directPrompt : `recipe with ${ingredients.join(', ')}`
        addActivity('recipe_generated', `Generated ${recipeName} recipe`)
      }

    } catch (error) {
      console.error("Error:", error)
      setResponse(`Error: ${error.message || 'Could not connect to the server or generate a response.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient('')
    }
  }

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleNewRecipe = () => {
    setDirectPrompt('')
    setServings(4)
    setIngredients([])
    setCurrentIngredient('')
    setResponse('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (promptType === 'ingredients' && currentIngredient.trim()) {
        addIngredient()
      } else {
        handleSubmit()
      }
    }
  }

  // Landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="pt-16 pb-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
              <div className="relative z-10">
                <ChefHat className="mx-auto mb-6 text-blue-400 animate-bounce-slow" size={80} />
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Welcome to Cook'o
                </h1>
                <p className="text-gray-300 text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                  Your Personal AI Chef Assistant - Transform any ingredient or craving into delicious, personalized recipes instantly.
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-400 animate-pulse mb-8">
                  <Sparkles className="animate-sparkle" size={28} />
                  <span className="text-3xl font-bold italic tracking-wide">Powered by Gemini AI</span>
                  <Sparkles className="animate-sparkle" size={28} />
                </div>
                <div className="flex gap-6 justify-center flex-wrap">
                  <Link 
                    to="/signup"
                    className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-dark-lg"
                  >
                    <Sparkles className="w-6 h-6" />
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    to="/signin"
                    className="flex items-center gap-3 px-10 py-5 border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white font-bold text-xl rounded-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="pb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-dark-800/50 backdrop-blur-xl rounded-3xl p-8 border border-dark-700/50 shadow-dark-lg text-center hover:transform hover:scale-105 transition-all duration-300">
                <Zap className="mx-auto mb-4 text-yellow-400" size={48} />
                <h3 className="text-xl font-bold text-white mb-3">Instant Recipes</h3>
                <p className="text-gray-300">Generate personalized recipes in seconds using advanced AI technology.</p>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-xl rounded-3xl p-8 border border-dark-700/50 shadow-dark-lg text-center hover:transform hover:scale-105 transition-all duration-300">
                <ChefHat className="mx-auto mb-4 text-blue-400" size={48} />
                <h3 className="text-xl font-bold text-white mb-3">Smart Cooking</h3>
                <p className="text-gray-300">Two ways to cook: Ask for specific dishes or use ingredients you have.</p>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-xl rounded-3xl p-8 border border-dark-700/50 shadow-dark-lg text-center hover:transform hover:scale-105 transition-all duration-300">
                <Heart className="mx-auto mb-4 text-red-400" size={48} />
                <h3 className="text-xl font-bold text-white mb-3">Save Favorites</h3>
                <p className="text-gray-300">Keep track of your favorite recipes and build your personal cookbook.</p>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-xl rounded-3xl p-8 border border-dark-700/50 shadow-dark-lg text-center hover:transform hover:scale-105 transition-all duration-300">
                <Users className="mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-xl font-bold text-white mb-3">Personal Profile</h3>
                <p className="text-gray-300">Track your cooking journey and recipe generation history.</p>
              </div>
            </div>
          </div>

          {/* How it Works Section */}
          <div className="pb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">How Cook'o Works</h2>
              <p className="text-gray-300 text-xl max-w-3xl mx-auto">Simple, fast, and intelligent recipe generation in just a few steps</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Choose Your Method</h3>
                <p className="text-gray-300 text-lg">Ask for a specific recipe or tell us what ingredients you have available.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Magic Happens</h3>
                <p className="text-gray-300 text-lg">Our Gemini AI analyzes your request and creates a personalized recipe instantly.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-pink-500 to-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Cook & Enjoy</h3>
                <p className="text-gray-300 text-lg">Follow the detailed instructions and enjoy your delicious homemade meal!</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="pb-16">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl p-12 text-center border border-blue-400/30">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Cooking?</h2>
              <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of home cooks who are already creating amazing meals with Cook'o
              </p>
              <Link 
                to="/signup"
                className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-2xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-dark-lg"
              >
                <ChefHat className="w-8 h-8" />
                Start Cooking Now
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Recipe generation interface for authenticated users
  return (
    <div className="min-h-screen bg-dark-900/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Back Section */}
        <div className="pt-16 pb-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
            <div className="relative z-10">
              <ChefHat className="mx-auto mb-6 text-blue-400 animate-bounce-slow" size={64} />
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Welcome back, {user.name} !
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                Ready to cook something delicious? Let's generate your next amazing recipe!@!
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-400 animate-pulse">
                <Sparkles className="animate-sparkle" size={24} />
                <span className="text-2xl font-bold italic tracking-wide">Powered by Gemini AI</span>
                <Sparkles className="animate-sparkle" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Generation Section */}
        <div className="pb-16">
          <div className="bg-dark-800/50 backdrop-blur-xl rounded-3xl p-8 border border-dark-700/50 shadow-dark-lg">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-4 md:gap-8 mb-2 flex-wrap" style={{ margin: '0 0 0 0' }}>
                <label className={`flex items-center gap-3 px-8 py-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 font-semibold hover:scale-105 hover:shadow-dark text-lg ${
                  promptType === 'direct' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400 shadow-dark' 
                    : 'bg-dark-700/50 text-gray-300 border-dark-600 hover:bg-dark-600/50 hover:border-dark-500'
                }`}>
                  <input 
                    type="radio" 
                    name="promptType" 
                    value="direct" 
                    checked={promptType === 'direct'}
                    onChange={(e) => setPromptType(e.target.value)}
                    className="accent-blue-500 w-5 h-5"
                  />
                  <span>Direct Recipe</span>
                </label>
                <label className={`flex items-center gap-3 px-8 py-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 font-semibold hover:scale-105 hover:shadow-dark text-lg ${
                  promptType === 'ingredients' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400 shadow-dark' 
                    : 'bg-dark-700/50 text-gray-300 border-dark-600 hover:bg-dark-600/50 hover:border-dark-500'
                }`}>
                  <input 
                    type="radio" 
                    name="promptType" 
                    value="ingredients" 
                    checked={promptType === 'ingredients'}
                    onChange={(e) => setPromptType(e.target.value)}
                    className="accent-blue-500 w-5 h-5"
                  />
                  <span>Ingredients-based Recipe</span>
                </label>
              </div>

              {promptType === 'direct' ? (
                <div className="flex justify-center">
                  <div className="flex items-end gap-4 justify-center">
                    <div className="w-96">
                      <input
                        type="text"
                        value={directPrompt}
                        onChange={(e) => setDirectPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask for any recipe directly (e.g., 'Spaghetti')"
                        className="w-full px-6 py-4 border-2 border-dark-600 rounded-2xl text-lg bg-dark-700/50 text-white backdrop-blur-sm transition-all duration-300 outline-none focus:border-blue-500 focus:shadow-dark focus:bg-dark-600/50 placeholder:text-gray-400 placeholder:italic disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-gray-300 font-medium text-sm">Number of people</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="w-24 px-4 py-4 border-2 border-dark-600 rounded-2xl text-lg bg-dark-700/50 text-white backdrop-blur-sm transition-all duration-300 outline-none focus:border-blue-500 focus:shadow-dark focus:bg-dark-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto pt-5">
                  {/* Add ingredient input */}
                  <div className="flex gap-3 w-full">
                    <input
                      type="text"
                      value={currentIngredient}
                      onChange={(e) => setCurrentIngredient(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter ingredients separately"
                      className="flex-1 px-6 py-4 border-2 border-dark-600 rounded-2xl text-lg bg-dark-700/50 text-white backdrop-blur-sm transition-all duration-300 outline-none focus:border-blue-500 focus:shadow-dark focus:bg-dark-600/50 placeholder:text-gray-400 placeholder:italic disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    />
                    <button
                      onClick={addIngredient}
                      disabled={isLoading || !currentIngredient.trim()}
                      className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Ingredients list */}
                  {ingredients.length > 0 && (
                    <div className="w-full">
                      <p className="text-gray-300 text-sm mb-3">Added ingredients:</p>
                      <div className="flex flex-wrap gap-2">
                        {ingredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-700/50 text-gray-300 rounded-xl border border-dark-600"
                          >
                            <span>{ingredient}</span>
                            <button
                              onClick={() => removeIngredient(index)}
                              disabled={isLoading}
                              className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Number of people and cooking time */}
                  <div className="flex gap-6 w-full justify-center">
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-300 font-medium text-sm">Number of people</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="w-24 px-4 py-3 border-2 border-dark-600 rounded-2xl text-lg bg-dark-700/50 text-white backdrop-blur-sm transition-all duration-300 outline-none focus:border-blue-500 focus:shadow-dark focus:bg-dark-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-300 font-medium text-sm">Cooking time (optional)</label>
                      <select
                        className="px-4 py-3 border-2 border-dark-600 rounded-2xl text-lg bg-dark-700/50 text-white backdrop-blur-sm transition-all duration-300 outline-none focus:border-blue-500 focus:shadow-dark focus:bg-dark-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      >
                        <option value="">Any time</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2+ hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-6 mt-5">
                <button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="flex items-center gap-3 px-8 py-4 border-none rounded-2xl text-lg font-semibold cursor-pointer transition-all duration-300 outline-none bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-dark hover:scale-105 hover:shadow-dark-lg hover:from-blue-600 hover:to-purple-700 active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ChefHat size={20} />
                      Generate Recipe
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleNewRecipe}
                  className="flex items-center gap-3 px-8 py-4 border-none rounded-2xl text-lg font-semibold cursor-pointer transition-all duration-300 outline-none bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-dark hover:scale-105 hover:shadow-dark-lg hover:from-gray-700 hover:to-gray-800 active:scale-100"
                >
                  <RefreshCw size={20} />
                  New Recipe
                </button>
              </div>

              {response && (
                <div className="mt-8">
                  <h3 className="text-center text-white text-2xl font-bold mb-6 flex items-center justify-center gap-2">
                    <ChefHat size={24} className="text-blue-400" />
                    Your Recipe
                  </h3>
                  <div className="bg-gradient-to-br from-dark-700/80 to-dark-800/80 backdrop-blur-xl rounded-3xl p-8 border border-dark-600/50 shadow-dark-lg min-h-[100px]">
                    <div 
                      className="recipe-content text-base text-gray-200 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(response) }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage