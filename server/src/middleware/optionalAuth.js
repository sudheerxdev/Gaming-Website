const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (user) {
      req.user = user;
    }

    return next();
  } catch (_error) {
    return next();
  }
};

module.exports = optionalAuth;
