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
  getNodalCentreReport,
} = require('../controllers/analyticsController');
const { getGA4Stats } = require('../controllers/gaController');

// Recording stats (registered users; guest users excluded)
router.post('/visit',            verifyToken, forbidRoles('guest'), recordVisit);
router.post('/visit/:id/update', verifyToken, forbidRoles('guest'), updateVisit);
router.post('/quiz',             verifyToken, forbidRoles('guest'), recordQuizAttempt);
router.post('/feedback',         verifyToken, forbidRoles('guest'), recordFeedback);
router.get('/my-performance',    verifyToken, forbidRoles('guest'), getMyPerformance);

// Viewing dashboard stats (staff only)
router.get('/dashboard',              verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getDashboardStats);
router.get('/google-analytics',       verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getGA4Stats);
router.get('/reports/academic',       verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getAcademicReport);
router.get('/reports/quizzes',        verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getQuizReport);
router.get('/reports/feedback',       verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getFeedbackReport);
router.get('/reports/pagewise',       verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getPagewiseReport);
router.get('/reports/nodal-centres',  verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getNodalCentreReport);
router.get('/student/:userId',        verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getStudentDetailsReport);

module.exports = router;
