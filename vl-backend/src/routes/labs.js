const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getLabs, getAllLabs, createLab, updateLab, deleteLab,
} = require('../controllers/labsController');

// Public
router.get('/', getLabs);

// Authenticated
router.get('/all',    verifyToken, requireRole('admin', 'content_admin'), getAllLabs);
router.post('/',      verifyToken, requireRole('admin', 'content_admin'), createLab);
router.put('/:id',    verifyToken, requireRole('admin', 'content_admin'), updateLab);
router.delete('/:id', verifyToken, requireRole('admin', 'content_admin'), deleteLab);

module.exports = router;
