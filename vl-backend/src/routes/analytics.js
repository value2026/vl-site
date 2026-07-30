const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  recordVisit,
  updateVisit,
  recordQuizAttempt,
  recordFeedback,
  getDashboardStats,
  getAcademicReport,
  getStudentDetailsReport,
  getMyPerformance,
  getQuizReport,
  getFeedbackReport,
  getPagewiseReport,
} = require('../controllers/analyticsController');
const { getGA4Stats } = require('../controllers/gaController');

// Recording stats (public for student role)
router.post('/visit',          verifyToken, recordVisit);
router.post('/visit/:id/update',       verifyToken, updateVisit);
router.post('/quiz',           verifyToken, recordQuizAttempt);
router.post('/feedback',       verifyToken, recordFeedback);
router.get('/my-performance', verifyToken, getMyPerformance);

// Viewing dashboard stats (staff only)
router.get('/dashboard',        verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'content_admin', 'nodal_centre', 'teacher'), getDashboardStats);
router.get('/google-analytics', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'content_admin', 'nodal_centre', 'teacher'), getGA4Stats);
router.get('/reports/academic', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'content_admin', 'nodal_centre', 'teacher'), getAcademicReport);
router.get('/student/:userId',  verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'content_admin', 'nodal_centre', 'teacher'), getStudentDetailsReport);

module.exports = router;
