const authService = require('../services/auth.service');

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
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  user.refreshToken = refreshToken;
  await user.save();
  res.json({ token, refreshToken });
};

/* Refresh Token */
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

/* Logout User */
const logout = async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};