const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getPapers,
  createPaper,
  deletePaper,
  getActiveAssignments,
  scheduleAssignment,
  sendReminder,
  publishResults,
  getAssignmentReport,
  resetAttempt,
  getMyAssignments,
  takeAssignment,
  submitAssignment,
  getNotifications,
  markAllNotificationsRead
} = require('../controllers/assignmentsController');

// All assignment routes require authentication
router.use(verifyToken);

// Student specific routes
router.get('/my-assignments', requireRole('student'), getMyAssignments);
router.get('/take/:id', requireRole('student'), takeAssignment);
router.post('/submit/:id', requireRole('student'), submitAssignment);
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);

// Teacher specific routes
router.get('/papers', requireRole('teacher'), getPapers);
router.post('/papers', requireRole('teacher'), createPaper);
router.delete('/papers/:id', requireRole('teacher'), deletePaper);
router.get('/active-assignments', requireRole('teacher'), getActiveAssignments);
router.post('/schedule', requireRole('teacher'), scheduleAssignment);
router.post('/remind/:id', requireRole('teacher'), sendReminder);
router.put('/publish/:id', requireRole('teacher'), publishResults);
router.get('/report/:id', requireRole('teacher'), getAssignmentReport);
router.delete('/attempts/:attemptId', requireRole('teacher'), resetAttempt);

module.exports = router;
