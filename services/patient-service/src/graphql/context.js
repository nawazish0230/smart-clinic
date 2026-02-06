const { extractTokenFromHeader, validateToken } = require('../utils/auth');
const logger = require('../utils/logger');

const createContext = async ({ req }) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const user = await validateToken(token);
      return {
        user: {
          userId: user.userId,
          email: user.email,
          roles: user.roles
        }
      }
    }
    return { user: null }
  } catch (error) {
    logger.error(error)
    return { user: null }
  }
}

module.exports = createContext;