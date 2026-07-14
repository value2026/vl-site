const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getSubjects, getAllSubjects, createSubject, updateSubject, deleteSubject,
} = require('../controllers/subjectsController');

// Public
router.get('/',    getSubjects);

// Admin only
router.get('/all', verifyToken, requireRole('admin'), getAllSubjects);
router.post('/',   verifyToken, requireRole('admin'), createSubject);
router.put('/:id', verifyToken, requireRole('admin'), updateSubject);
router.delete('/:id', verifyToken, requireRole('admin'), deleteSubject);

module.exports = router;
