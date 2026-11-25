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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(',')
].map(origin => origin && origin.trim()).filter(Boolean);

app.use(cors((req, callback) => {
  const requestOrigin = `${req.protocol}://${req.get('host')}`;
  callback(null, {
    origin: function (origin, originCallback) {
      if (!origin) return originCallback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin === requestOrigin
      ) {
        return originCallback(null, true);
      }
      try {
        const parsed = new URL(origin);
        if (
          parsed.hostname.endsWith('amrita.edu') ||
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname.startsWith('10.') ||
          parsed.hostname.startsWith('192.168.')
        ) {
          return originCallback(null, true);
        }
      } catch (_) {}
      originCallback(new Error('Not allowed by CORS'));
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

// ── Flash Cross-Domain Policy ─────────────────────────────────
const FLASH_CROSS_DOMAIN_XML = `<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
    <site-control permitted-cross-domain-policies="all"/>
    <allow-access-from domain="*" secure="false"/>
    <allow-http-request-headers-from domain="*" headers="*" secure="false"/>
</cross-domain-policy>`;

app.get(['/crossdomain.xml', '/files/crossdomain.xml', '/v2/crossdomain.xml', '/v2/files/crossdomain.xml'], (_req, res) => {
  res.type('application/xml').send(FLASH_CROSS_DOMAIN_XML);
});

// ── Static file serving for uploaded content ──────────────────
// Files at /files/experiments/{id}/content/aim.html etc.
const uploadsDir = path.join(__dirname, '../uploads');

// Case-insensitive file path resolver for Linux environments
function resolveCaseInsensitivePath(baseDir, reqPath) {
  let parts = [];
  try {
    parts = decodeURIComponent(reqPath).split('/').filter(Boolean);
  } catch {
    return null;
  }
  let current = path.resolve(baseDir);

  for (const part of parts) {
    if (part === '.' || part === '..') return null;
    const target = path.join(current, part);
    if (fs.existsSync(target)) {
      current = target;
      continue;
    }
    try {
      const entries = fs.readdirSync(current);
      const lowerPart = part.toLowerCase();
      const match = entries.find(e => e.toLowerCase() === lowerPart);
      if (!match) return null;
      current = path.join(current, match);
    } catch {
      return null;
    }
  }

  try {
    const stat = fs.statSync(current);
    return stat.isFile() ? current : null;
  } catch {
    return null;
  }
}

// Automatically patch Flash simulation on disk if needed
function patchFlashSimulationOnDisk(dir) {
  if (!dir || !fs.existsSync(dir)) return;
  const indexHtmlPath = path.join(dir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    try {
      let html = fs.readFileSync(indexHtmlPath, 'utf8');
      if (html.includes('copyText') || html.includes('flashplayer')) {
        const dynamicScript = `
// Dynamically compute SWF path relative to current URL
(function() {
  try {
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    const basePath = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    const swfPath = basePath + '/flash/simulation/index.swf';
    const el = document.getElementById('copyText');
    if (el) el.textContent = swfPath;
  } catch(e) {}
})();
`;
        const jsDir = path.join(dir, 'js');
        const mainJsPath = path.join(jsDir, 'main.js');
        if (fs.existsSync(mainJsPath)) {
          let js = fs.readFileSync(mainJsPath, 'utf8');
          if (!js.includes('swfPath') && !js.includes('window.location.href')) {
            js = dynamicScript.trim() + '\n\n' + js;
            fs.writeFileSync(mainJsPath, js, 'utf8');
          }
        }
      }
    } catch {}
  }
}

// Normalize existing sim-root folder casing and patch simulation links on startup
function normalizeExistingSimRoots(uploadsRoot) {
  const labsDir = path.join(uploadsRoot, 'labs');
  if (!fs.existsSync(labsDir)) return;
  try {
    const labEntries = fs.readdirSync(labsDir);
    for (const labId of labEntries) {
      const labPath = path.join(labsDir, labId);
      if (!fs.statSync(labPath).isDirectory()) continue;
      const expEntries = fs.readdirSync(labPath);
      for (const expId of expEntries) {
        const expPath = path.join(labPath, expId);
        if (!fs.statSync(expPath).isDirectory()) continue;

        const simRootPath = path.join(expPath, 'sim-root');
        if (fs.existsSync(simRootPath) && fs.statSync(simRootPath).isDirectory()) {
          const commonLower = path.join(simRootPath, 'common');
          const commonUpper = path.join(simRootPath, 'Common');

          if (fs.existsSync(commonLower) && !fs.existsSync(commonUpper)) {
            try { fs.cpSync(commonLower, commonUpper, { recursive: true }); } catch {}
          } else if (fs.existsSync(commonUpper) && !fs.existsSync(commonLower)) {
            try { fs.cpSync(commonUpper, commonLower, { recursive: true }); } catch {}
          }

          const simDir = path.join(simRootPath, 'simulation');
          patchFlashSimulationOnDisk(simDir);
        }

        const standardSimDir = path.join(expPath, 'simulation');
        if (fs.existsSync(standardSimDir)) {
          patchFlashSimulationOnDisk(standardSimDir);
        }
      }
    }
  } catch (err) {
    console.warn('Notice: Existing sim-roots scan completed:', err.message);
  }
}

// Run normalization asynchronously on server startup
normalizeExistingSimRoots(uploadsDir);

// Middleware: Intercept Flash simulation index.html to dynamically set #copyText to actual current URL
app.use('/files', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  let decodedPath = '';
  try {
    decodedPath = decodeURIComponent(req.path);
  } catch {
    return next();
  }

  let targetPath = path.join(uploadsDir, decodedPath);
  try {
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
    }
  } catch {
    return next();
  }

  if (targetPath.endsWith('index.html') && fs.existsSync(targetPath)) {
    try {
      let content = fs.readFileSync(targetPath, 'utf8');
      if (content.includes('copyText') || content.includes('flashplayer')) {
        const dynamicScript = `
<script>
(function() {
  try {
    var el = document.getElementById("copyText");
    if (el) {
      var currentUrl = window.location.href.split('?')[0].split('#')[0];
      var basePath = currentUrl.substring(0, currentUrl.lastIndexOf("/"));
      el.textContent = basePath + "/flash/simulation/index.swf";
    }
  } catch(e) {}
})();
</script>`;
        if (!content.includes('basePath + "/flash/simulation/index.swf"')) {
          content = content.replace('</body>', dynamicScript + '\n</body>');
        }
        return res.type('html').send(content);
      }
    } catch {}
  }
  next();
});

// Standard static file serving
app.use('/files', express.static(uploadsDir));

// Fallback for case-sensitive filesystems (Linux)
app.use('/files', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const resolved = resolveCaseInsensitivePath(uploadsDir, req.path);
  if (resolved) {
    return res.sendFile(resolved);
  }
  next();
});

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
