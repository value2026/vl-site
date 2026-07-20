const jwt = require('jsonwebtoken');

/**
 * Verifies JWT from Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Role guard — pass allowed roles as arguments.
 * Example: requireRole('admin', 'nodal_centre')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(403).json({ message: 'Insufficient permissions' });

  // Admin has all access
  if (req.user.role === 'admin') return next();

  // VL Manager implicitly has sim_admin privileges
  if (req.user.role === 'vl_manager' && roles.includes('sim_admin')) return next();

  if (!roles.includes(req.user.role)) {
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
