import { useState, useEffect } from 'react'
import { ChefHat, Search, Trash2, Eye, Clock, Users, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const RecipesPage = () => {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showModal, setShowModal] = useState(false)

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
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-blue-300 py-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white py-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mt-12 mb-8">$1</h1>')
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

  useEffect(() => {
    if (user) {
      fetchRecipes()
    }
  }, [user])

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecipes(data.data.recipes)
      } else {
        console.error('Failed to fetch recipes')
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteRecipe = async (recipeId) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setRecipes(recipes.filter(recipe => recipe._id !== recipeId))
      }
    } catch (error) {
      console.error('Error deleting recipe:', error)
    }
  }

  const toggleFavorite = async (recipeId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/recipes/${recipeId}/favorite`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Update the recipe in the local state
        setRecipes(recipes.map(recipe => 
          recipe._id === recipeId 
            ? { ...recipe, isFavorite: !recipe.isFavorite }
            : recipe
        ))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const viewRecipe = (recipe) => {
    setSelectedRecipe(recipe)
    setShowModal(true)
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-teal-900 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="mx-auto mb-4 text-blue-400 animate-bounce" size={48} />
          <p className="text-gray-400">Please sign in to view your recipes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-teal-900 backdrop-blur-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            My Recipe Collection
          </h1>
          <p className="text-gray-300 text-lg pt-2">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-cyan-800/70 backdrop-blur-xl rounded-3xl p-6 border border-dark-700/50 shadow-dark-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search recipes or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="text-center py-12">
            <ChefHat className="mx-auto mb-4 text-blue-400 animate-bounce" size={48} />
            <p className="text-gray-400">Loading your recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-400 text-lg mb-4">
              {searchTerm 
                ? 'No recipes match your search criteria' 
                : 'No recipes yet! Generate your first recipe to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-cyan-800/50 backdrop-blur-xl rounded-2xl p-6 border border-dark-700/50 shadow-dark hover:border-blue-500/50 transition-all duration-200 flex flex-col h-[320px]"
              >
                {/* Header with title and favorite button - fixed height */}
                <div className="flex justify-between items-start mb-4 min-h-[60px]">
                  <h3 className="text-xl font-semibold text-white line-clamp-2 flex-1 pr-2">
                    {recipe.title}
                  </h3>
                  <button
                    onClick={() => toggleFavorite(recipe._id)}
                    className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      recipe.isFavorite
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart size={20} fill={recipe.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Ingredients section - flexible height */}
                <div className="mb-4 flex-1">
                  <p className="text-gray-400 text-sm mb-2">Ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-dark-700/50 text-gray-300 text-xs rounded-lg truncate max-w-[120px]"
                        title={ingredient}
                      >
                        {ingredient}
                      </span>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <span className="px-2 py-1 bg-dark-700/50 text-gray-400 text-xs rounded-lg">
                        +{recipe.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer section - fixed height */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                    </div>
                    {recipe.category && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                        {recipe.category}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewRecipe(recipe)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-200 font-medium"
                    >
                      <Eye size={16} />
                      View Recipe
                    </button>
                    <button
                      onClick={() => deleteRecipe(recipe._id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipe Modal */}
        {showModal && selectedRecipe && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-dark-800 rounded-3xl p-8 max-w-6xl w-full max-h-[85vh] overflow-y-auto border border-dark-700">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedRecipe.title}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Ingredients:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-dark-700/50 text-gray-300 text-sm rounded-lg"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Recipe Details:</h3>
                <div className="bg-gradient-to-br from-dark-700/80 to-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/50 shadow-dark-lg">
                  <div 
                    className="recipe-content text-base text-gray-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: convertMarkdownToHTML(selectedRecipe.instructions) 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipesPage