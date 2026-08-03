const express  = require('express');
const router   = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getSections,
  updateSection,
  toggleVisibility,
  reorderSections,
  seedPage,
  submitSurveyResponse,
  getSurveyResponses,
  deleteSurveyResponse,
} = require('../controllers/pagesController');

// Public — no auth
router.get('/:slug/sections', getSections);
router.post('/:slug/survey', submitSurveyResponse);

// Admin and Coordinator operations
router.get('/:slug/survey/responses',          verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), getSurveyResponses);
router.post('/:slug/survey/responses/:id/delete', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), deleteSurveyResponse);
router.post('/:slug/sections/reorder',          verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), reorderSections);
router.post('/:slug/sections/:id/update',              verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), updateSection);
router.post('/:slug/sections/:id/visibility', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), toggleVisibility);
router.post('/:slug/seed',                     verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), seedPage);

module.exports = router;
