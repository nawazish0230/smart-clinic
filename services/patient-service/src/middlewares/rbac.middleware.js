/**
 * RBAC Middleware - check if user has required role(s)
 * @param {string[]} roles - required roles
 * @returns {function} - middleware function
 * @throws {Error} - if user does not have required role(s)
 */
const requiredRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Insufficient permissions',
        required: roles,
        current: userRoles,
      });
    }
    next();
  }
};

/**
 * Required patient or clinician / admin roles
 */

const requiredPatientOrClinicianRole = requiredRole(['patient', 'doctor', 'clinician', 'admin']);

/**
 * Required clinician or admin roles (healthcare provider only)
 */

const requiredClinician = requiredRole(['doctor', 'clinician', 'admin']);

/**
 * Required admin roles 
 */

const requiredAdminRole = requiredRole(['admin']);

module.exports = {
  requiredRole,
  requiredPatientOrClinicianRole,
  requiredClinician,
  requiredAdminRole,
};