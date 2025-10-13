const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate token for user
const generateTokenForUser = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name
  };
  
  return generateToken(payload);
};

// Extract token from request headers
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  // Check for "Bearer TOKEN" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

module.exports = {
  generateToken,
  verifyToken,
  generateTokenForUser,
  extractTokenFromHeader
};