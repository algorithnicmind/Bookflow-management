const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'leave-mgmt-secret-key-2026';
const JWT_EXPIRES_IN = '24h';

/**
 * Middleware: Authenticate JWT token from Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware factory: Restrict access to specific roles
 * Usage: requireRole('manager', 'admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET, JWT_EXPIRES_IN };
