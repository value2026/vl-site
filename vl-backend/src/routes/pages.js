const express  = require('express');
const router   = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getSections,
  updateSection,
  toggleVisibility,
  reorderSections,
  seedPage,
} = require('../controllers/pagesController');

// Public — no auth
router.get('/:slug/sections', getSections);

// Admin-only operations
router.put('/:slug/sections/reorder',          verifyToken, requireRole('admin'), reorderSections);
router.put('/:slug/sections/:id',              verifyToken, requireRole('admin'), updateSection);
router.patch('/:slug/sections/:id/visibility', verifyToken, requireRole('admin'), toggleVisibility);
router.post('/:slug/seed',                     verifyToken, requireRole('admin'), seedPage);

module.exports = router;
