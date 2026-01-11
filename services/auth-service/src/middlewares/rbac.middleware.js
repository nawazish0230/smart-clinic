const { AuthenticationError } = require('../utils/errors');
const { USER_ROLES } = require('../models/User');

/**
 * RBAC middleware - check if user has the required role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Function} - RBAC middleware function
 */
const requiredRole = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required',
      });
    }
    const userRoles = user.roles;
    const hasRole = roles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        error: true,
        message:
          'Forbidden: You do not have the required role to access this resource',
        required: roles,
        current: userRoles,
      });
    }
    next();
  };
};

/**
 * RBAC middleware - check if user has any required role
 * @returns {Function} - RBAC middleware function
 */
const requiredAnyRole = (...roles) => {
  return requiredRole(...roles);
};

/**
 * RBAC middleware - check if user has all required roles
 * @returns {Function} - RBAC middleware function
 */
const requiredAllRoles = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required',
      });
    }
    const userRoles = user.roles;
    const hasAllRoles = roles.every(role => userRoles.includes(role));
    if (!hasAllRoles) {
      return res.status(403).json({
        error: true,
        message:
          'Forbidden: You do not have all the required roles to access this resource',
        required: roles,
        current: userRoles,
      });
    }
    next();
  };
};

/**
 * Predefined middleware for common
 *
 */
const requiredAdmin = requiredRole(USER_ROLES.ADMIN);
const requiredDoctor = requiredRole(USER_ROLES.DOCTOR, USER_ROLES.CLINICIAN);
const requiredClinician = requiredRole(
  USER_ROLES.CLINICIAN,
  USER_ROLES.DOCTOR,
  USER_ROLES.PATIENT
);
const requiredPatient = requiredRole(USER_ROLES.PATIENT);

module.exports = {
  requiredRole,
  requiredAnyRole,
  requiredAllRoles,
  requiredAdmin,
  requiredDoctor,
  requiredClinician,
  requiredPatient,
};
