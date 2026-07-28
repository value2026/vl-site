const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getLabs, getAllLabs, createLab, updateLab, deleteLab,
} = require('../controllers/labsController');

// Public
router.get('/', getLabs);

// Authenticated
router.get('/all',    verifyToken, requireRole('admin', 'content_admin', 'vl_manager'), getAllLabs);
router.post('/',      verifyToken, requireRole('admin', 'content_admin', 'vl_manager'), createLab);
router.put('/:id',    verifyToken, requireRole('admin', 'content_admin', 'vl_manager'), updateLab);
router.delete('/:id', verifyToken, requireRole('admin', 'content_admin', 'vl_manager'), deleteLab);

module.exports = router;
