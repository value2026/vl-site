const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getSubjects, getAllSubjects, createSubject, updateSubject, deleteSubject,
} = require('../controllers/subjectsController');

// Public
router.get('/',    getSubjects);

// Admin + content managers
router.get('/all', verifyToken, requireRole('admin', 'content_admin', 'vl_manager', 'vl_coordinator'), getAllSubjects);
router.post('/',   verifyToken, requireRole('admin', 'content_admin', 'vl_manager', 'vl_coordinator'), createSubject);
router.post('/:id/update', verifyToken, requireRole('admin', 'content_admin', 'vl_manager', 'vl_coordinator'), updateSubject);
router.post('/:id/delete', verifyToken, requireRole('admin', 'content_admin', 'vl_manager', 'vl_coordinator'), deleteSubject);

module.exports = router;
