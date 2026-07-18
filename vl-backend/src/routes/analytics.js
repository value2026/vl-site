const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  recordVisit,
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

// Recording stats (public for student role)
router.post('/visit',          verifyToken, recordVisit);
router.post('/quiz',           verifyToken, recordQuizAttempt);
router.post('/feedback',       verifyToken, recordFeedback);
router.get('/my-performance', verifyToken, getMyPerformance);

// Viewing dashboard stats (staff only)
router.get('/dashboard',        verifyToken, requireRole('admin', 'content_admin', 'nodal_centre', 'teacher'), getDashboardStats);
router.get('/reports/academic', verifyToken, requireRole('admin', 'content_admin', 'nodal_centre', 'teacher'), getAcademicReport);
router.get('/reports/quizzes',  verifyToken, requireRole('admin', 'content_admin', 'nodal_centre', 'teacher'), getQuizReport);
router.get('/reports/feedback', verifyToken, requireRole('admin', 'content_admin', 'nodal_centre', 'teacher'), getFeedbackReport);
router.get('/reports/pagewise', verifyToken, requireRole('admin', 'content_admin', 'nodal_centre', 'teacher'), getPagewiseReport);
router.get('/student/:userId',  verifyToken, requireRole('admin', 'content_admin', 'nodal_centre', 'teacher'), getStudentDetailsReport);

module.exports = router;
