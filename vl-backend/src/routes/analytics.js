const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole, forbidRoles } = require('../middleware/auth');
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

// Recording stats (registered users; guest users excluded)
router.post('/visit',            verifyToken, forbidRoles('guest'), recordVisit);
router.post('/visit/:id/update', verifyToken, forbidRoles('guest'), updateVisit);
router.post('/quiz',             verifyToken, forbidRoles('guest'), recordQuizAttempt);
router.post('/feedback',         verifyToken, forbidRoles('guest'), recordFeedback);
router.get('/my-performance',    verifyToken, forbidRoles('guest'), getMyPerformance);

// Viewing dashboard stats (staff only)
router.get('/dashboard',        verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getDashboardStats);
router.get('/google-analytics', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getGA4Stats);
router.get('/reports/academic', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getAcademicReport);
router.get('/student/:userId',  verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getStudentDetailsReport);

module.exports = router;
