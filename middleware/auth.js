const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Socket.IO auth middleware
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('AUTH_REQUIRED: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isGuest) {
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      socket.isGuest = true;
      return next();
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return next(new Error('AUTH_REQUIRED: User not found'));
    }

    socket.user = user;
    socket.userId = user._id.toString();
    socket.username = user.username;
    next();
  } catch (err) {
    next(new Error('AUTH_REQUIRED: Invalid or expired token'));
  }
};

module.exports = { authMiddleware, socketAuthMiddleware };
