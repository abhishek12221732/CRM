const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthenticatedError } = require('../utils/errors');

const authMiddleware = async (req, res, next) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provided');
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new UnauthenticatedError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Not authorized to access this route');
  }
};

module.exports = authMiddleware;