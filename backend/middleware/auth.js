const jwt = require('jsonwebtoken');

// JWT TOKEN VERIFICATION MIDDLEWARE
// Validates Bearer token from Authorization header
// Extracts user ID and email for use in protected routes
const authMiddleware = (req, res, next) => {
  try {
    // EXTRACT TOKEN FROM BEARER HEADER
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // VERIFY TOKEN AND DECODE USER INFO
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
