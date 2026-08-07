require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { logError, logException, logRejection, logFrontendError, logAccess } = require('./utils/logger');
const { getExternalBaseUrl } = require('./utils/requestUrl');

// Override console.error to intercept all caught errors application-wide
const originalConsoleError = console.error;
console.error = function (...args) {
  const err = args.find(arg => arg instanceof Error) || args.join(' ');
  logError(err);
  originalConsoleError.apply(console, args);
};


const authRoutes        = require('./routes/auth');
const userRoutes        = require('./routes/users');
const subjectRoutes     = require('./routes/subjects');
const labRoutes         = require('./routes/labs');
const experimentRoutes  = require('./routes/experiments');
const analyticsRoutes   = require('./routes/analytics');
const callRoutes        = require('./routes/calls');
const pagesRoutes       = require('./routes/pages');
const institutionRoutes = require('./routes/institutions');
const workshopRoutes    = require('./routes/workshops');
const assignmentRoutes  = require('./routes/assignments');

const app  = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// ── Middleware ────────────────────────────────────────────────
// ── Middleware ────────────────────────────────────────────────
const toOrigin = (value) => {
  const trimmed = value && value.trim();
  if (!trimmed) return '';

  try {
    return new URL(trimmed).origin;
  } catch (_) {
    return trimmed.replace(/\/+$/, '');
  }
};

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(',')
].map(toOrigin).filter(Boolean);

/*const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(',')
].map(origin => origin && origin.trim()).filter(Boolean);
*/
app.use(cors((req, callback) => {
  const requestOrigin = `${req.protocol}://${req.get('host')}`;
  callback(null, {
    origin: function (origin, originCallback) {
      if (!origin) return originCallback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin === requestOrigin
      ) {
        originCallback(null, true);
      } else {
        originCallback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
}));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logAccess({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: duration,
      ip: req.ip || req.connection.remoteAddress
    });
  });
  next();
});

// ── Static file serving for uploaded content ──────────────────
// Files at /files/experiments/{id}/content/aim.html etc.
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/files', express.static(uploadsDir));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/subjects',    subjectRoutes);
app.use('/api/labs',        labRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/analytics',   analyticsRoutes);
app.use('/api/calls',       callRoutes);
app.use('/api/pages',       pagesRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/workshops',    workshopRoutes);
app.use('/api/assignments',  assignmentRoutes);

// Local media upload endpoint (fallback when Cloudinary is not configured)
const multer = require('multer');
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'media');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

app.post('/api/upload', imageUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const relativeUrl = `media/${req.file.filename}`;
    const absoluteUrl = `${getExternalBaseUrl(req)}/files/${relativeUrl}`;
    console.log(`📸 Local uploader: Saved image to ${absoluteUrl}`);
    res.json({ url: absoluteUrl });
  } catch (err) {
    console.error('❌ Media upload failed:', err);
    logError(err);
    res.status(500).json({ message: 'Media upload failed' });
  }
});

// Frontend error log endpoint
app.post('/api/logs/frontend', (req, res) => {
  try {
    logFrontendError(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to log frontend error:', err);
    res.status(500).json({ success: false });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Virtual Labs API is running 🚀' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  logError(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Process-level handlers to catch all remaining unhandled backend failures
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  logException(err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logRejection(reason);
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nVirtual Labs API listening on port ${PORT}`);
  console.log(`   Health: /api/health\n`);
  
  // Launch student migration as a completely separate background process!
  // This prevents the heavy password hashing from blocking the web server!
  const { fork } = require('child_process');
  const path = require('path');
  const migrationScript = path.join(__dirname, 'background_migration.js');
  
  console.log('🚀 Spawning background worker for student migrations...');
  const worker = fork(migrationScript);
  
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.log(`⚠️ Background migration worker exited with code ${code}`);
    }
  });
});
