const express = require('express');
const router  = express.Router();
const { login, getMe, forgotPassword, resetPassword, changePassword, recordLogout, refreshTokenEndpoint } = require('../controllers/authController');
const { verifyToken }  = require('../middleware/auth');

router.post('/login', login);
router.post('/refresh', refreshTokenEndpoint);
router.get('/me', verifyToken, getMe);
router.post('/logout', recordLogout); // Log logout reason

// Password recovery and changes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);
router.post('/change-password',  verifyToken, changePassword);

module.exports = router;
