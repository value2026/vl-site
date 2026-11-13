const express = require('express');
const router  = express.Router();
const {
  login,
  guestRegister,
  verifyGuestEmail,
  resendGuestVerification,
  googleAuth,
  getAuthConfig,
  getMe,
  updateGuestProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  recordLogout,
  refreshTokenEndpoint,
  activateAccount,
  resendActivation,
} = require('../controllers/authController');
const { verifyToken }  = require('../middleware/auth');

/**
 * Simple in-memory per-IP rate limiter for public authentication endpoints.
 */
const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 30 } = {}) => {
  const buckets = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    if (buckets.size > 5000) {
      for (const [k, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(k);
      }
    }
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (existing.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    existing.count += 1;
    return next();
  };
};

const guestAuthLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

router.get('/config',          getAuthConfig);
router.post('/login',          login);
router.post('/guest/register',            guestAuthLimiter, guestRegister);
router.post('/guest/verify-email',        guestAuthLimiter, verifyGuestEmail);
router.post('/guest/resend-verification', guestAuthLimiter, resendGuestVerification);
router.post('/google',                    guestAuthLimiter, googleAuth);
router.post('/refresh', refreshTokenEndpoint);
router.get('/me', verifyToken, getMe);
router.post('/guest/profile', verifyToken, updateGuestProfile);
router.put('/guest/profile', verifyToken, updateGuestProfile);
router.post('/logout', recordLogout); // Log logout reason

// Password recovery and changes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);
router.post('/change-password',  verifyToken, changePassword);

// Account activation (admin-created users)
router.post('/activate',          activateAccount);
router.post('/resend-activation', resendActivation);

module.exports = router;
