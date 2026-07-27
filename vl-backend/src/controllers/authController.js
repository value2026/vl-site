const crypto        = require('crypto');
const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const prisma        = require('../db');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { logAudit, logError } = require('../utils/logger');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' });
    }

    const cleanIdentifier = email.toLowerCase().trim();

    // Find user by either email or username (case-insensitive for username)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: { equals: cleanIdentifier, mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }

    const token = jwt.sign(
      {
        id:           user.id,
        email:        user.email,
        role:         user.role,
        name:         user.name,
        nodalCentreId: user.nodalCentreId,
        customPermissions: user.customPermissions || [],
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logAudit({
      action: 'USER_LOGIN',
      user: user.email,
      details: { role: user.role },
      ip: req.ip || req.connection.remoteAddress
    });

    res.json({
      token,
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        nodalCentreId: user.nodalCentreId,
        customPermissions: user.customPermissions || [],
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    logError(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id:           true,
        name:         true,
        email:        true,
        role:         true,
        isActive:     true,
        customPermissions: true,
        nodalCentreId: true,
        createdAt:    true,
        nodalCentre:  { select: { name: true } },
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // For security reasons, do not explicitly reveal if email is not found
    if (!user) {
      return res.json({ message: 'If this email is registered, a password reset link has been sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });

    // Send email
    await sendPasswordResetEmail(user, token);

    res.json({ message: 'If this email is registered, a password reset link has been sent.' });
  } catch (err) {
    console.error('ForgotPassword error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });

    logAudit({
      action: 'PASSWORD_CHANGE',
      user: user.email,
      ip: req.ip || req.connection.remoteAddress
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('ChangePassword error:', err);
    logError(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { login, getMe, forgotPassword, resetPassword, changePassword };
