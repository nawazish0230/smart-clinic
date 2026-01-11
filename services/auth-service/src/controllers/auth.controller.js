const authService = require('../services/auth.service');
const { User } = require('../models/User');
const logger = require('../utils/logger');

/* Register new user */
const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const result = await authService.register(userData);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result,
    });
  } catch (error) {
    next(error);
  }
};

/* login user */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }
    const result = await authService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user: result,
    });
  } catch (error) {
    next(error);
  }
};

/* Refresh Token */
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  res.json({ token });
};

/* Logout User */
const logout = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    user.refreshToken = undefined;
    await user.save();
    logger.info(`User logged out: ${user.email}`);
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const profile = await authService.getProfile(userId);
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};
