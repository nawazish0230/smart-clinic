const { body, validationResult } = require('express-validator');

/*
  Validation middleware - check validation results
  @param {Request} req - Express request object
  @param {Response} res - Express response object
  @param {Function} next - Express next function
  @returns {Function} - Validation middleware function - if validation fails, return 400 status with errors
*/
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  return next();
};

/*
  Register validation rules
  @param {Array} validations - Array of validation rules
  @returns {Function} - Validation middleware function
*/

const validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({min: 2})
        .withMessage('First name must be at least 2 characters long'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({min: 2})
        .withMessage('Last name must be at least 2 characters long'),
    body('roles')
        .optional()
        .isArray()
        .withMessage('Roles must be an array of strings'),
    validate,
];


/*
* Login validation rules
@param {Array} validations - Array of validation rules
@returns {Function} - Validation middleware function
*/
const validateLogin = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').trim(),
  validate,
];

/*
* Refresh token validation rules
@param {Array} validations - Array of validation rules
@returns {Function} - Validation middleware function
*/
const validateRefreshToken = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required').trim(),
  validate,
];


module.exports = { validate, validateRegister, validateLogin, validateRefreshToken };