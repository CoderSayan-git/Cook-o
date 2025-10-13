const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { body } = require('express-validator');

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Validation rules for recipe generation
const generateRecipeValidation = [
  body('type')
    .isIn(['direct', 'ingredients'])
    .withMessage('Type must be either "direct" or "ingredients"'),
  body('prompt')
    .if(body('type').equals('direct'))
    .notEmpty()
    .withMessage('Prompt is required for direct recipe generation'),
  body('servings')
    .if(body('type').equals('direct'))
    .isInt({ min: 1, max: 20 })
    .withMessage('Servings must be a number between 1 and 20 for direct recipes'),
  body('ingredients')
    .if(body('type').equals('ingredients'))
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required')
];

// Generate recipe using AI
const generateRecipe = async (req, res) => {
  try {
    const { type, prompt, ingredients, servings } = req.body;
    const userId = req.user ? req.user._id : null;

    let aiPrompt = '';
    let originalPrompt = '';

    if (type === 'direct') {
      const numberOfPeople = servings || 4; // Default to 4 if not provided
      originalPrompt = prompt;
      aiPrompt = `You are a professional chef and cookbook author. Create a comprehensive, detailed recipe for "${prompt}" that serves exactly ${numberOfPeople} people. 

                  Please provide a complete recipe with the following structure:

                  **Recipe Title**: Give it an appealing, descriptive name

                  **Description**: Write a 2-3 sentence engaging introduction about the dish - its origins, what makes it special, or when it's best enjoyed.

                  **Prep Time**: Estimated preparation time
                  **Cook Time**: Estimated cooking time  
                  **Total Time**: Combined prep and cook time
                  **Servings**: ${numberOfPeople} people
                  **Difficulty**: Beginner/Intermediate/Advanced

                  **Ingredients**: 
                  - List ALL ingredients with precise measurements
                  - Include both metric and imperial measurements where helpful
                  - Specify brands or types when it matters (e.g., "kosher salt", "extra virgin olive oil")
                  - Group ingredients by component if it's a complex dish

                  **Equipment Needed**:
                  - List essential tools and equipment

                  **Instructions**:
                  - Provide detailed, numbered step-by-step instructions
                  - Include techniques and tips for each step
                  - Mention visual cues (e.g., "until golden brown", "until bubbling")
                  - Include temperature guidelines for cooking
                  - Explain the "why" behind important steps

                  **Chef's Tips**:
                  - Include 2-3 professional tips for best results
                  - Mention common mistakes to avoid
                  - Suggest ingredient substitutions if applicable

                  **Serving Suggestions**:
                  - Recommend accompaniments or side dishes
                  - Suggest presentation ideas

                  **Storage & Leftovers**:
                  - How to store and for how long
                  - Reheating instructions if applicable

                  **Nutritional Highlights** (optional):
                  - Brief mention of key nutritional benefits

                  Write in a warm, encouraging tone that makes cooking approachable for all skill levels. Use clear, concise language and be specific with quantities, temperatures, and timing.`;
    } else {
      const numberOfPeople = servings || 4; // Default to 4 if not provided
      const timeLimit = req.body.time || null; // Get time limit if provided
      originalPrompt = ingredients.join(', ');
      
      let timeInstruction = '';
      if (timeLimit) {
        timeInstruction = ` The total cooking time (prep + cook time) should be approximately ${timeLimit} minutes or less.`;
      }
      
      aiPrompt = `You are a creative chef specializing in recipe development. Create an innovative and delicious recipe using these primary ingredients: ${ingredients.join(', ')} that serves exactly ${numberOfPeople} people.${timeInstruction}

                  Please follow this detailed structure:

                  **Recipe Title**: Create an appealing name that highlights the main ingredients

                  **Description**: Write 2-3 sentences explaining what makes this dish special and when it's perfect to enjoy.

                  **Prep Time**: Estimated preparation time${timeLimit ? ` (keep within the ${timeLimit}-minute total time constraint)` : ''}
                  **Cook Time**: Estimated cooking time${timeLimit ? ` (keep within the ${timeLimit}-minute total time constraint)` : ''}
                  **Total Time**: Combined time${timeLimit ? ` (should not exceed ${timeLimit} minutes)` : ''}
                  **Servings**: ${numberOfPeople} people (all ingredient quantities adjusted for this serving size)
                  **Difficulty**: Rate as Beginner/Intermediate/Advanced

                  **Complete Ingredients List**:
                  - Start with the provided ingredients: ${ingredients.join(', ')}
                  - Add complementary ingredients needed to create a complete, balanced dish
                  - Provide precise measurements for all ingredients scaled for ${numberOfPeople} people
                  - Include both metric and imperial measurements where helpful
                  - Specify types/brands when important (e.g., "sea salt", "extra virgin olive oil")

                  **Equipment Needed**:
                  - List all necessary tools and cookware${timeLimit ? ' (prioritize time-efficient equipment if applicable)' : ''}

                  **Step-by-Step Instructions**:
                  - Provide detailed, numbered cooking steps optimized for ${numberOfPeople} servings
                  - Include preparation techniques and cooking methods${timeLimit ? ` that fit within the ${timeLimit}-minute timeframe` : ''}
                  - Mention visual and aromatic cues for each stage
                  - Give specific temperatures and timing${timeLimit ? ' (ensure total time stays within limit)' : ''}
                  - Explain important techniques clearly${timeLimit ? ' while maintaining efficiency' : ''}

                  **Chef's Professional Tips**:
                  - Share 2-3 expert tips for optimal results
                  - Mention potential pitfalls and how to avoid them
                  - Suggest ingredient alternatives or substitutions

                  **Serving & Presentation**:
                  - Recommend how to plate and serve the dish
                  - Suggest complementary side dishes or drinks

                  **Storage Instructions**:
                  - How to properly store leftovers
                  - Shelf life and reheating guidelines

                  **Flavor Profile**:
                  - Describe the taste, texture, and overall eating experience

                  Be creative while ensuring the recipe is practical and achievable for ${numberOfPeople} people${timeLimit ? ` within the ${timeLimit}-minute timeframe` : ''}. Focus on maximizing the flavors of the provided ingredients while creating a harmonious, complete dish${timeLimit ? ' that can be prepared efficiently' : ''}. Write in an encouraging, professional tone suitable for home cooks of all levels.`;
    }

    // Generate recipe using Gemini AI with fallback models
    let model;
    let result;
    // Use stable, widely available models, starting with latest stable versions
    const modelOptions = [
      'gemini-flash-latest',      // Latest stable flash model
      'gemini-2.5-flash',         // Stable 2.5 flash
      'gemini-2.0-flash',         // Stable 2.0 flash
      'gemini-2.0-flash-001',     // Specific version
      'gemini-pro-latest',        // Latest stable pro model (fallback)
      'gemini-2.5-pro'            // Stable pro model (last resort)
    ];
    
    let lastError = null;
    
    for (const modelName of modelOptions) {
      try {
        console.log(`🧪 Trying model: ${modelName}`);
        model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(aiPrompt);
        console.log(`✅ Successfully used model: ${modelName}`);
        break; // Success, exit loop
      } catch (error) {
        console.log(`❌ Model ${modelName} failed:`, error.message.substring(0, 200));
        lastError = error;
        
        // If it's a quota error, wait a bit and try next model
        if (error.message.includes('quota') || error.message.includes('429')) {
          console.log('   Quota exceeded, trying next model...');
          continue;
        }
        
        // For other errors, try next model immediately
        continue;
      }
    }
    
    // If all models failed, throw the last error
    if (!result) {
      throw lastError || new Error('All Gemini models failed');
    }
    const response = await result.response;
    const recipeText = response.text();

    // Extract recipe details (basic parsing)
    const recipeTitle = extractRecipeTitle(recipeText);
    const recipeIngredients = type === 'ingredients' ? ingredients : extractIngredients(recipeText);
    const recipeCategory = detectRecipeCategory(recipeTitle, recipeText);

    // Save recipe to database if user is authenticated
    let savedRecipe = null;
    if (userId) {
      try {
        savedRecipe = new Recipe({
          user: userId,
          title: recipeTitle,
          ingredients: recipeIngredients,
          instructions: recipeText,
          category: recipeCategory,
          promptType: type,
          originalPrompt: originalPrompt
        });

        await savedRecipe.save();

        // Increment user's recipe count
        await User.findByIdAndUpdate(userId, {
          $inc: { recipesGenerated: 1 }
        });
      } catch (saveError) {
        console.error('Error saving recipe:', saveError);
        // Continue without saving if there's an error
      }
    }

    res.json({
      success: true,
      data: {
        text: recipeText,
        recipe: savedRecipe,
        cached: false
      }
    });

  } catch (error) {
    console.error('Recipe generation error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.message.includes('API key') || error.message.includes('API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error - Invalid API key'
      });
    }

    if (error.message.includes('model') || error.message.includes('Model') || error.message.includes('not found') || error.message.includes('404')) {
      return res.status(500).json({
        success: false,
        message: 'AI model not available. Please try again later or contact support.'
      });
    }

    if (error.message.includes('quota') || error.message.includes('QUOTA') || error.message.includes('429')) {
      return res.status(429).json({
        success: false,
        message: 'AI service quota exceeded. Please try again in a few minutes.',
        retryAfter: 60
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's recipes
const getUserRecipes = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const isFavorite = req.query.favorite === 'true';

    // Build query
    const query = { user: userId };
    if (category) query.category = category;
    if (isFavorite) query.isFavorite = true;

    // Get recipes with pagination
    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Recipe.countDocuments(query);

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recipes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single recipe
const getRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    const recipe = await Recipe.findOne({
      _id: recipeId,
      user: userId
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      data: {
        recipe
      }
    });

  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle recipe favorite status
const toggleFavorite = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    const recipe = await Recipe.findOne({
      _id: recipeId,
      user: userId
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    await recipe.toggleFavorite();

    // Update user's favorite count
    const favoriteCount = await Recipe.countDocuments({
      user: userId,
      isFavorite: true
    });

    await User.findByIdAndUpdate(userId, {
      favoriteRecipes: favoriteCount
    });

    res.json({
      success: true,
      message: `Recipe ${recipe.isFavorite ? 'added to' : 'removed from'} favorites`,
      data: {
        recipe
      }
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    const recipe = await Recipe.findOneAndDelete({
      _id: recipeId,
      user: userId
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Update user's recipe counts
    const totalRecipes = await Recipe.countDocuments({ user: userId });
    const favoriteRecipes = await Recipe.countDocuments({ 
      user: userId, 
      isFavorite: true 
    });

    await User.findByIdAndUpdate(userId, {
      recipesGenerated: totalRecipes,
      favoriteRecipes: favoriteRecipes
    });

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });

  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions
const extractRecipeTitle = (recipeText) => {
  const lines = recipeText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('Ingredients:') && !trimmed.startsWith('Instructions:')) {
      // Remove markdown formatting
      return trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '').substring(0, 200);
    }
  }
  return 'Generated Recipe';
};

const extractIngredients = (recipeText) => {
  const ingredients = [];
  const lines = recipeText.split('\n');
  let inIngredientsSection = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().includes('ingredients:')) {
      inIngredientsSection = true;
      continue;
    }
    if (trimmed.toLowerCase().includes('instructions:') || trimmed.toLowerCase().includes('directions:')) {
      break;
    }
    if (inIngredientsSection && trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed))) {
      const ingredient = trimmed.replace(/^[-•\d.]\s*/, '').trim();
      if (ingredient) ingredients.push(ingredient);
    }
  }
  
  return ingredients.length > 0 ? ingredients : ['Mixed ingredients'];
};

const detectRecipeCategory = (recipeTitle, recipeText = '') => {
  const title = recipeTitle.toLowerCase();
  const text = (recipeTitle + ' ' + recipeText).toLowerCase();
  
  // More specific beverage patterns - check title first for precision
  const beveragePatterns = [
    /\b(boba|bubble)\s+tea\b/,
    /\b(iced?|hot)\s+(tea|coffee|chocolate)\b/,
    /\b(green|black|herbal|chai)\s+tea\b/,
    /\b(smoothie|milkshake|frappuccino|latte|cappuccino|espresso|macchiato)\b/,
    /\b(juice|lemonade|punch|cocktail|mocktail|lassi)\b/,
    /\b(matcha|bubble|boba)\b.*\b(tea|drink|latte)\b/
  ];
  
  // Check if title specifically indicates a beverage
  const isBeverage = beveragePatterns.some(pattern => pattern.test(title)) ||
                   title.includes('drink') ||
                   title.includes('beverage') ||
                   (title.includes('tea') && !title.includes('tea leaf') && !title.includes('tea spice')) ||
                   (title.includes('coffee') && !title.includes('coffee bean') && !title.includes('coffee rub'));
  
  if (isBeverage) {
    return 'Beverage';
  }
  
  // Dessert keywords - more specific
  const dessertKeywords = [
    'cake', 'cookie', 'cookies', 'pie', 'ice cream', 'gelato', 'sorbet', 'candy', 'dessert',
    'pudding', 'mousse', 'tart', 'brownie', 'brownies', 'donut', 'donuts', 'pastry', 'custard',
    'tiramisu', 'cheesecake', 'fudge', 'truffle', 'macaron', 'cupcake', 'cupcakes',
    'chocolate cake', 'sweet treat', 'dessert', 'sundae', 'parfait'
  ];
  
  // Check for dessert - look for exact matches or phrases
  if (dessertKeywords.some(keyword => title.includes(keyword)) ||
      /\bchocolate\b.*\b(cake|dessert|sweet|treat)\b/.test(title) ||
      /\bsweet\b.*\b(treat|dessert|cake)\b/.test(title)) {
    return 'Dessert';
  }
  
  // Breakfast keywords - more specific
  const breakfastKeywords = [
    'pancake', 'pancakes', 'waffle', 'waffles', 'cereal', 'oatmeal', 'breakfast',
    'toast', 'bagel', 'muffin', 'muffins', 'croissant', 'french toast',
    'eggs benedict', 'scrambled eggs', 'fried eggs', 'omelet', 'omelette',
    'breakfast burrito', 'breakfast sandwich', 'granola', 'hash brown', 'hash browns'
  ];
  
  if (breakfastKeywords.some(keyword => title.includes(keyword)) ||
      title.includes('breakfast') ||
      /\beggs?\b.*\b(scrambled|fried|poached|benedict)\b/.test(title)) {
    return 'Breakfast';
  }
  
  // Snack keywords - more specific
  const snackKeywords = [
    'chips', 'dip', 'crackers', 'nuts', 'popcorn', 'pretzel', 'pretzels', 'trail mix',
    'appetizer', 'finger food', 'chicken wings', 'buffalo wings', 'nachos',
    'cheese balls', 'deviled eggs', 'stuffed', 'bites'
  ];
  
  if (snackKeywords.some(keyword => title.includes(keyword)) ||
      title.includes('snack') ||
      title.includes('appetizer') ||
      /\bstuffed\b.*\b(mushroom|pepper|olive)\b/.test(title)) {
    return 'Snack';
  }
  
  // Lunch keywords - more specific  
  const lunchKeywords = [
    'sandwich', 'wrap', 'wraps', 'salad', 'soup', 'burger', 'burgers', 'pizza',
    'panini', 'sub', 'submarine', 'club sandwich', 'pasta salad', 'chicken salad',
    'tuna salad', 'lunch', 'quesadilla', 'tacos', 'burrito'
  ];
  
  if (lunchKeywords.some(keyword => title.includes(keyword)) ||
      title.includes('lunch') ||
      /\b(chicken|tuna|egg|caesar)\s+salad\b/.test(title)) {
    return 'Lunch';
  }
  
  // Default to Dinner for main dishes, meat, pasta, rice dishes, etc.
  return 'Dinner';
};

module.exports = {
  generateRecipe,
  getUserRecipes,
  getRecipe,
  toggleFavorite,
  deleteRecipe,
  generateRecipeValidation
};