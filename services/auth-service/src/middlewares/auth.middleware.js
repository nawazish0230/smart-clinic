const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const { AuthenticationError } = require('../utils/errors');

/**
 * Authentication middleware - verify JWT acccess token
 * @returns {Function} - Authentication middleware function
 */
const authenticate = (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw new AuthenticationError('No token provided');
    }
    // verify JWT access token
    const decoded = verifyAccessToken(token);
    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    };
    next();
  } catch (error) {
    if (error instanceof AuthenticationError || error.message.includes('token')) {
      return res.status(401).json({
        error: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = { authenticate };