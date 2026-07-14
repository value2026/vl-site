const multer  = require('multer');
const AdmZip  = require('adm-zip');
const path    = require('path');
const fs      = require('fs');

// ── Temp storage for incoming zips ─────────────────────────
const tmpDir = path.join(__dirname, '../../tmp');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = file.mimetype === 'application/zip'
    || file.mimetype === 'application/x-zip-compressed'
    || file.mimetype === 'application/octet-stream'
    || file.originalname.toLowerCase().endsWith('.zip');
  ok ? cb(null, true) : cb(new Error('Only ZIP files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// ── Extracts zip to targetDir, then deletes the temp zip ────
const extractZip = (zipPath, targetDir) => {
  fs.mkdirSync(targetDir, { recursive: true });
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(targetDir, /* overwrite */ true);
  try { fs.unlinkSync(zipPath); } catch (_) { /* ignore */ }
};

// ── Resolve uploads base dir ────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const uploadsPath = (...parts) => path.join(UPLOADS_DIR, ...parts);

module.exports = { upload, extractZip, uploadsPath, UPLOADS_DIR };
