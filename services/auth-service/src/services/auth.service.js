const { User, USER_ROLES, USER_STATUS } = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { ConflictError, AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

const register = async (userData) => {
  const { email, password, firstName, lastName, roles } = userData;
  // check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('User already exists');
  }

  // set default role if not provided
  const userRoles = roles && roles.length > 0 ? roles : [USER_ROLES.PATIENT];

  // create a new user
  const user = new User({ 
    email: email.toLowerCase(), 
    password, 
    firstName, 
    lastName, 
    roles: userRoles, 
    status: USER_STATUS.ACTIVE 
  });

  // save the user
  await user.save();

  const payload = {
    userId: user._id,
    email: user.email,
    roles: user.roles,
  }

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({userId: user._id.toString()});

  // save refresh token to user document
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({validateBeforeSave: false});

  logger.info(`New user registered: ${user.email}`);
  // return user data and tokens

  return {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      status: user.status,
    },
    accessToken,
    refreshToken,
  };
};

/***
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - User data and tokens
 */
const login = async (req, res) => {
  // find the user with password field
  const { email, password } = req.body;

  // if user exisit or not
  const user = user.findByEmail(email);
  if(!user){
    throw new AuthenticationError('Email not found');
  }

  // check if user is active
  if(user.status !== USER_STATUS.ACTIVE){
    throw new AuthenticationError('User is not active');
  }

  // verify password
  const isPasswordValid = await user.comparePassword(password);
  if(!isPasswordValid){
    throw new AuthenticationError('Email/Password is incorrect');
  }

  // generate JWT token
  const payload = {
    userId: user._id,
    email: user.email,
    roles: user.roles,
  }

  // generate/update refresh token
  const jwtToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({userId: user._id.toString()});

  user.refreshToken = refreshToken;


  // save refresh token to user

  // return the user and tokens
};

module.exports = {
  register,
};