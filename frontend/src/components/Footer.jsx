import { Heart, Github, Twitter, Linkedin, Mail, ChefHat, Sparkles } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl leading-none">COOK'o</span>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-yellow-400 animate-sparkle" />
                  <span className="text-blue-400 text-sm font-medium">Food Master AI</span>
                  <Sparkles className="w-3 h-3 text-yellow-400 animate-sparkle" />
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Your AI-powered culinary companion. Generate amazing recipes from ingredients you have or discover new dishes with our advanced recipe generator powered by Google Gemini AI.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                className="p-3 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded-lg transition-all duration-200 transform hover:scale-110 border border-dark-700 hover:border-dark-600"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="p-3 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-blue-400 rounded-lg transition-all duration-200 transform hover:scale-110 border border-dark-700 hover:border-dark-600"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                className="p-3 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-blue-500 rounded-lg transition-all duration-200 transform hover:scale-110 border border-dark-700 hover:border-dark-600"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@cooker.ai"
                className="p-3 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200 transform hover:scale-110 border border-dark-700 hover:border-dark-600"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Recipe Generator
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Browse Recipes
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Features</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  AI Recipe Generation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Ingredient-based Search
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Dietary Preferences
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Cooking Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Nutritional Info
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© {currentYear} COOK'o. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>by</span>
              <span className="text-blue-400 font-medium">Sayan Dhara</span>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center sm:justify-start space-x-6 mt-4 pt-4 border-t border-dark-800">
            <a href="#" className="text-gray-500 hover:text-gray-400 transition-colors duration-200 text-xs">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-400 transition-colors duration-200 text-xs">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-400 transition-colors duration-200 text-xs">
              Cookie Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-400 transition-colors duration-200 text-xs">
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer