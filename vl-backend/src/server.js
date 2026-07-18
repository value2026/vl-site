require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const http    = require('http');
const { initSocket } = require('./socket');

const authRoutes        = require('./routes/auth');
const userRoutes        = require('./routes/users');
const subjectRoutes     = require('./routes/subjects');
const labRoutes         = require('./routes/labs');
const experimentRoutes  = require('./routes/experiments');
const analyticsRoutes   = require('./routes/analytics');
const callRoutes        = require('./routes/calls');
const pagesRoutes       = require('./routes/pages');

const app  = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);
initSocket(server);

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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
    const absoluteUrl = `${req.protocol}://${req.get('host')}/files/${relativeUrl}`;
    console.log(`📸 Local uploader: Saved image to ${absoluteUrl}`);
    res.json({ url: absoluteUrl });
  } catch (err) {
    console.error('❌ Media upload failed:', err);
    res.status(500).json({ message: 'Media upload failed' });
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
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 Virtual Labs API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
