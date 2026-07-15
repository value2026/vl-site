const express = require('express');
const router  = express.Router();
const { login, getMe, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { verifyToken }  = require('../middleware/auth');

router.post('/login', login);
router.get('/me', verifyToken, getMe);

// Password recovery and changes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);
router.put('/change-password',  verifyToken, changePassword);

module.exports = router;
