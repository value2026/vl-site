const crypto        = require('crypto');
const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma        = require('../db');
const { sendPasswordResetEmail, sendGuestVerificationEmail, sendActivationEmail } = require('../utils/mailer');
const { logAudit, logError } = require('../utils/logger');

const GUEST_SYSTEM_EMAIL = 'guest@virtuallabs.local';
const GUEST_AGE_GROUPS = [
  '0 - 15',
  '16 - 20',
  '21 - 25',
  '26 - 30',
  '31 - 35',
  '36 - 40',
  '41 - 45',
  '46 - 50',
  'Above 50',
];
const GUEST_GENDERS = ['Male', 'Female'];
const GUEST_PROFESSIONS = ['Student', 'Academician', 'Others'];
const MAX_VERIFICATION_ATTEMPTS = 5;

const USER_PROFILE_SELECT = {
  id:                true,
  name:              true,
  email:             true,
  role:              true,
  isActive:          true,
  customPermissions: true,
  nodalCentreId:     true,
  createdAt:         true,
  nodalCentre:       { select: { name: true } },
  mobile:            true,
  profilePic:        true,
  org:               true,
  dept:              true,
  country:           true,
  state:             true,
  city:              true,
  ageGroup:          true,
  gender:            true,
  profession:        true,
  university:        true,
  emailVerified:     true,
};

const cleanGuestString = (v, max = 100) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Parse and validate guest profile attributes shared between registration and profile updates.
 */
const parseGuestProfileInput = (body = {}, { requireComplete = false } = {}) => {
  const name = cleanGuestString(body?.name, 80);
  const ageGroup = cleanGuestString(body?.ageGroup, 20);
  const gender = cleanGuestString(body?.gender, 20);
  const mobile = cleanGuestString(body?.mobile, 24);
  const profession = cleanGuestString(body?.profession, 40);
  const org = cleanGuestString(body?.college ?? body?.org, 120);
  const dept = cleanGuestString(body?.subject ?? body?.dept, 100);
  const university = cleanGuestString(body?.university, 120);
  const country = cleanGuestString(body?.country, 80);
  const state = cleanGuestString(body?.state, 80);

  if (!name) return { error: 'Full name is required.' };
  if ((requireComplete && !ageGroup) || (ageGroup && !GUEST_AGE_GROUPS.includes(ageGroup))) {
    return { error: 'Please select a valid age group.' };
  }
  if ((requireComplete && !gender) || (gender && !GUEST_GENDERS.includes(gender))) {
    return { error: 'Please select your gender.' };
  }
  if (mobile && !/^[+\d\s()-]{7,24}$/.test(mobile)) {
    return { error: 'Please enter a valid phone number.' };
  }
  if ((requireComplete && !profession) || (profession && !GUEST_PROFESSIONS.includes(profession))) {
    return { error: 'Please select a valid profession.' };
  }
  if (requireComplete && !country) {
    return { error: 'Please select a country.' };
  }

  return {
    data: {
      name,
      ageGroup: ageGroup || null,
      gender: gender || null,
      mobile: mobile || null,
      profession: profession || null,
      org: org || null,
      dept: dept || null,
      university: university || null,
      country: country || null,
      state: state || null,
    },
  };
};

const hashVerificationSecret = (purpose, email, secret) =>
  crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'vl-verification-fallback')
    .update(`${purpose}:${email}:${secret}`)
    .digest('hex');

const constantTimeHexEqual = (expectedHex, candidateHex) => {
  if (!expectedHex || !candidateHex || expectedHex.length !== candidateHex.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expectedHex, 'hex'), Buffer.from(candidateHex, 'hex'));
};

const createGuestVerificationBundle = (email) => {
  const otp = String(crypto.randomInt(100000, 1000000));
  const token = crypto.randomBytes(32).toString('hex');
  return {
    otp,
    token,
    otpHash: hashVerificationSecret('otp', email, otp),
    tokenHash: hashVerificationSecret('token', email, token),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
};

let cachedOAuthClient = null;
let cachedOAuthClientId = '';

const getGoogleOAuthClient = (clientId) => {
  if (!cachedOAuthClient || cachedOAuthClientId !== clientId) {
    cachedOAuthClient = new OAuth2Client(clientId);
    cachedOAuthClientId = clientId;
  }
  return cachedOAuthClient;
};

const signAuthTokens = (user, { nameOverride, refreshClaims } = {}) => {
  const displayName = nameOverride || user.name;
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: displayName,
      nodalCentreId: user.nodalCentreId,
      customPermissions: user.customPermissions || [],
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const refreshToken = jwt.sign(
    { id: user.id, ...(refreshClaims || {}) },
    refreshSecret,
    { expiresIn: '7d' }
  );
  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: displayName,
      email: user.email,
      role: user.role,
      nodalCentreId: user.nodalCentreId,
      customPermissions: user.customPermissions || [],
    },
  };
};

// GET /api/auth/config
const getAuthConfig = (_req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : '';
  res.set('Cache-Control', 'no-store');
  res.json({
    googleEnabled: Boolean(googleClientId),
    googleClientId,
  });
};

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

    if (user.email === GUEST_SYSTEM_EMAIL) {
      return res.status(403).json({
        message: 'Please register as a guest or sign in with Google to continue.',
      });
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

    if (user.emailVerified === false) {
      return res.status(403).json({
        message: 'Please verify your email address before signing in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    const authPayload = signAuthTokens(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: authPayload.refreshToken } });

    logAudit({
      action: 'USER_LOGIN',
      user: user.email,
      details: { role: user.role },
      ip: req.ip || req.connection.remoteAddress
    });

    res.json(authPayload);
  } catch (err) {
    console.error('Login error:', err);
    logError(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/guest/register
const guestRegister = async (req, res) => {
  try {
    const email = cleanGuestString(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const parsed = parseGuestProfileInput(req.body, { requireComplete: true });
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email === GUEST_SYSTEM_EMAIL) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: 'Password must be between 6 and 128 characters.' });
    }

    const { name, ageGroup, gender, mobile, profession, org, dept, university, country, state } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && (existing.role !== 'guest' || existing.emailVerified)) {
      return res.status(409).json({
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verification = createGuestVerificationBundle(email);
    const guestData = {
      name,
      email,
      password: hashedPassword,
      role: 'guest',
      isActive: true,
      ageGroup,
      gender,
      mobile,
      profession,
      org,
      dept,
      university,
      country,
      state,
      emailVerified: false,
      emailVerificationOtpHash: verification.otpHash,
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpiresAt: verification.expiresAt,
      emailVerificationAttempts: 0,
      customPermissions: [],
      managedSubjectIds: [],
    };

    const guestUser = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: guestData })
      : await prisma.user.create({ data: guestData });

    await sendGuestVerificationEmail(guestUser, verification.otp, verification.token);

    logAudit({
      action: 'USER_GUEST_REGISTER_PENDING',
      user: guestUser.email,
      details: { role: 'guest', profession, country, org: org || undefined },
      ip: req.ip || req.connection.remoteAddress,
    });

    res.status(201).json({
      requiresVerification: true,
      email: guestUser.email,
      message: 'Verification code sent to your email. Please verify your email before signing in.',
    });
  } catch (err) {
    console.error('Guest registration error:', err);
    logError(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/guest/verify-email
const verifyGuestEmail = async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';

    if (!email || (!otp && !token)) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'guest' || user.email === GUEST_SYSTEM_EMAIL) {
      return res.status(400).json({ message: 'Invalid or expired verification request.' });
    }

    if (user.emailVerified) {
      return res.json({
        verified: true,
        email: user.email,
        message: 'Email already verified. You can sign in now.',
      });
    }

    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    let matched = false;
    if (token && user.emailVerificationTokenHash) {
      const candidateTokenHash = hashVerificationSecret('token', email, token);
      matched = constantTimeHexEqual(user.emailVerificationTokenHash, candidateTokenHash);
    }

    if (!matched && otp && user.emailVerificationOtpHash) {
      if (user.emailVerificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        return res.status(429).json({
          message: 'Too many incorrect attempts. Please request a new verification code.',
        });
      }
      const candidateOtpHash = hashVerificationSecret('otp', email, otp);
      matched = constantTimeHexEqual(user.emailVerificationOtpHash, candidateOtpHash);
    }

    if (!matched) {
      if (otp) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerificationAttempts: { increment: 1 } },
        });
      }
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationOtpHash: null,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
        emailVerificationAttempts: 0,
      },
    });

    logAudit({
      action: 'USER_GUEST_EMAIL_VERIFIED',
      user: user.email,
      details: { role: 'guest' },
      ip: req.ip || req.connection.remoteAddress,
    });

    res.json({
      verified: true,
      email: user.email,
      message: 'Email verified successfully. Please sign in to continue.',
    });
  } catch (err) {
    console.error('Guest email verification error:', err);
    logError(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/guest/resend-verification
const resendGuestVerification = async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'guest' || user.email === GUEST_SYSTEM_EMAIL || user.emailVerified) {
      return res.json({
        message: 'If this email is pending verification, a new verification code has been sent.',
      });
    }

    const verification = createGuestVerificationBundle(email);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationOtpHash: verification.otpHash,
        emailVerificationTokenHash: verification.tokenHash,
        emailVerificationExpiresAt: verification.expiresAt,
        emailVerificationAttempts: 0,
      },
    });

    await sendGuestVerificationEmail(user, verification.otp, verification.token);

    res.json({
      message: 'A new verification code has been sent to your email.',
    });
  } catch (err) {
    console.error('Resend guest verification error:', err);
    logError(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Shared user lookup, provisioning, and session creation for verified Google OAuth users.
 */
const finalizeOAuthUserSession = async ({ email, rawName, picture, provider = 'GOOGLE', req }) => {
  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail === GUEST_SYSTEM_EMAIL) {
    return { status: 403, body: { message: 'Reserved email cannot be used for Google sign-in.' } };
  }

  const displayName = (rawName || normalizedEmail.split('@')[0] || 'Guest Learner').trim().slice(0, 80);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existing && !['guest', 'student'].includes(existing.role)) {
    return {
      status: 403,
      body: {
        message: 'Staff and administrator accounts must sign in using email/username and password.',
      },
    };
  }

  if (existing && !existing.isActive) {
    return {
      status: 401,
      body: {
        message: 'Your account has been deactivated. Please contact the administrator.',
      },
    };
  }

  let user;
  if (!existing) {
    // Users without a teacher-created student account register with guest privileges only.
    const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    user = await prisma.user.create({
      data: {
        name: displayName,
        email: normalizedEmail,
        password: randomPasswordHash,
        role: 'guest',
        isActive: true,
        profilePic: picture || null,
        customPermissions: [],
        managedSubjectIds: [],
      },
    });
  } else if (existing.role === 'student') {
    // Teacher-created student accounts keep full student privileges when entering via OAuth.
    user = !existing.profilePic && picture
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { profilePic: picture },
        })
      : existing;
  } else {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: existing.name || displayName,
        profilePic: picture || existing.profilePic,
        emailVerified: true,
        emailVerificationOtpHash: null,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
        emailVerificationAttempts: 0,
        customPermissions: [],
        managedSubjectIds: [],
      },
    });
  }

  const authPayload = signAuthTokens(user);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: authPayload.refreshToken },
  });

  logAudit({
    action: existing
      ? (user.role === 'student' ? `USER_${provider}_STUDENT_LOGIN` : `USER_${provider}_GUEST_LOGIN`)
      : `USER_${provider}_GUEST_REGISTER`,
    user: user.email,
    details: { role: user.role },
    ip: req.ip || req.connection.remoteAddress,
  });

  return { status: 200, body: authPayload };
};

// POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : '';
    if (!clientId) {
      return res.status(503).json({ message: 'Google Sign-In is not configured on the server yet.' });
    }

    const { credential, accessToken } = req.body || {};
    let payload = null;

    if (credential && typeof credential === 'string') {
      try {
        const oauthClient = getGoogleOAuthClient(clientId);
        const ticket = await oauthClient.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.warn('Google ID token verification failed:', verifyErr.message);
        return res.status(401).json({ message: 'Invalid or expired Google sign-in token' });
      }
    } else if (accessToken && typeof accessToken === 'string') {
      try {
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
        );
        if (!tokenInfoRes.ok) {
          return res.status(401).json({ message: 'Invalid or expired Google access token' });
        }
        const tokenInfo = await tokenInfoRes.json();
        const audienceMatch = tokenInfo.aud === clientId || tokenInfo.azp === clientId;
        if (!audienceMatch) {
          return res.status(401).json({ message: 'Google token was not issued for this application' });
        }

        const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!userInfoRes.ok) {
          return res.status(401).json({ message: 'Unable to fetch verified Google profile' });
        }
        const userInfo = await userInfoRes.json();
        payload = {
          email: userInfo.email || tokenInfo.email,
          email_verified: Boolean(
            userInfo.email_verified ?? (tokenInfo.email_verified === true || tokenInfo.email_verified === 'true')
          ),
          name: userInfo.name,
          picture: userInfo.picture || null,
        };
      } catch (verifyErr) {
        console.warn('Google access token verification failed:', verifyErr.message);
        return res.status(401).json({ message: 'Invalid or expired Google access token' });
      }
    } else {
      return res.status(400).json({ message: 'Google sign-in token is required' });
    }

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account email must be verified' });
    }

    const result = await finalizeOAuthUserSession({
      email: payload.email,
      rawName: payload.name,
      picture: payload.picture || null,
      provider: 'GOOGLE',
      req,
    });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Google auth error:', err);
    logError(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: USER_PROFILE_SELECT,
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'guest' && user.email === GUEST_SYSTEM_EMAIL && req.user?.name) {
      return res.json({ ...user, name: req.user.name });
    }

    res.json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST|PUT /api/auth/guest/profile
const updateGuestProfile = async (req, res) => {
  try {
    if (req.user?.role !== 'guest') {
      return res.status(403).json({ message: 'Only guest accounts can use this profile endpoint.' });
    }

    const existing = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    if (existing.email === GUEST_SYSTEM_EMAIL) {
      return res.status(403).json({ message: 'Shared demo guest sessions cannot update profile details.' });
    }

    const parsed = parseGuestProfileInput(req.body, { requireComplete: false });
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: parsed.data,
      select: USER_PROFILE_SELECT,
    });

    logAudit({
      action: 'USER_GUEST_PROFILE_UPDATED',
      user: updatedUser.email,
      details: { role: 'guest' },
      ip: req.ip || req.connection.remoteAddress,
    });

    res.json({
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (err) {
    console.error('UpdateGuestProfile error:', err);
    logError(err);
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

    // For security reasons, do not explicitly reveal if email is not found; also skip system placeholder
    if (!user || user.email === GUEST_SYSTEM_EMAIL) {
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

    if (!user || user.email === GUEST_SYSTEM_EMAIL) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
        refreshToken: null
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
    if (req.user.role === 'guest') {
      return res.status(403).json({ message: 'Guest accounts cannot change passwords' });
    }
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
    if (user.role === 'guest') {
      return res.status(403).json({ message: 'Guest accounts cannot change passwords' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed, refreshToken: null }
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

// POST /api/auth/logout
const recordLogout = async (req, res) => {
  try {
    const { reason } = req.body;
    let userEmail = 'Unknown';
    let userId = 'Unknown';
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.email) {
          userEmail = decoded.email;
          userId = decoded.id;
          
          // Invalidate per-user session in DB (skip shared anonymous guest row)
          if (decoded.email !== GUEST_SYSTEM_EMAIL) {
            await prisma.user.update({
              where: { id: userId },
              data: { refreshToken: null }
            }).catch(err => console.error('Failed to clear refresh token:', err));
          }
        }
      } catch (e) {
        // Ignore decode errors
      }
    }

    logAudit({
      action: 'USER_LOGOUT',
      user: userEmail,
      details: { reason: reason || 'USER_LOGOUT', userId },
      ip: req.ip || req.connection.remoteAddress
    });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout logging error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/refresh
const refreshTokenEndpoint = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (e) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    if (decoded.kind === 'guest') {
      const guestUser = await prisma.user.findFirst({
        where: { id: decoded.id, email: GUEST_SYSTEM_EMAIL, role: 'guest' },
      });
      if (!guestUser) return res.status(403).json({ message: 'Invalid refresh token' });
      if (!guestUser.isActive) return res.status(403).json({ message: 'Account deactivated' });

      const displayName = decoded.name || 'Guest Learner';
      const refreshed = signAuthTokens(guestUser, {
        nameOverride: displayName,
        refreshClaims: { kind: 'guest', name: displayName },
      });
      return res.json({ token: refreshed.token, refreshToken: refreshed.refreshToken });
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.id, refreshToken }
    });

    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const refreshed = signAuthTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshed.refreshToken }
    });

    res.json({ token: refreshed.token, refreshToken: refreshed.refreshToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/activate
const activateAccount = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Activation token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await prisma.user.findFirst({
      where: {
        activationToken: token,
        activationTokenExpiry: { gte: new Date() },
        isActivated: false,
      }
    });

    if (!user) {
      return res.status(400).json({
        message: 'This activation link is invalid or has expired. Please contact your administrator.',
        code: 'INVALID_ACTIVATION_TOKEN',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:              hashed,
        isActivated:           true,
        activationToken:       null,
        activationTokenExpiry: null,
      }
    });

    logAudit({
      action: 'ACCOUNT_ACTIVATED',
      user: user.email,
      ip: req.ip || req.connection.remoteAddress
    });

    res.json({ message: 'Account activated successfully! You can now log in.' });
  } catch (err) {
    console.error('ActivateAccount error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/resend-activation
const resendActivation = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Always return a vague success for security
    if (!user || user.isActivated !== false) {
      return res.json({ message: 'If this account exists and is pending activation, a new link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { activationToken: token, activationTokenExpiry: expiry }
    });

    await sendActivationEmail(user, token);

    res.json({ message: 'If this account exists and is pending activation, a new link has been sent.' });
  } catch (err) {
    console.error('ResendActivation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login, guestRegister, verifyGuestEmail, resendGuestVerification, googleAuth, getAuthConfig,
  getMe, updateGuestProfile, forgotPassword, resetPassword, changePassword, recordLogout,
  refreshTokenEndpoint, activateAccount, resendActivation,
};
