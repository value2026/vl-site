const jwt = require('jsonwebtoken');

/**
 * Verifies JWT from Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(`[AUTH DEBUG] No token found in Authorization header`);
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(`[AUTH DEBUG] JWT verification failed: ${err.message}. Secret used length: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0}`);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Role guard — pass allowed roles as arguments.
 * Example: requireRole('admin', 'nodal_centre')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    console.log(`[AUTH DEBUG] requireRole failed: req.user is undefined`);
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  // Admin has all access
  if (req.user.role === 'admin') return next();

  if (!roles.includes(req.user.role)) {
    console.log(`[AUTH DEBUG] requireRole failed: User role "${req.user.role}" is not in allowed roles: ${JSON.stringify(roles)}`);
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

/**
 * Permission guard — checks if user has a specific customPermission string.
 */
const requirePermission = (permissionStr) => (req, res, next) => {
  if (!req.user) return res.status(403).json({ message: 'Insufficient permissions' });
  
  // Admin has all access
  if (req.user.role === 'admin') return next();
  
  const perms = req.user.customPermissions || [];
  if (!perms.includes(permissionStr)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

module.exports = { verifyToken, requireRole, requirePermission };
