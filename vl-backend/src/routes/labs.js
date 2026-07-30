const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getLabs, getAllLabs, createLab, updateLab, deleteLab,
} = require('../controllers/labsController');

// Public
router.get('/', getLabs);

// Authenticated
router.get('/all',    verifyToken, requireRole('admin', 'content_admin', 'vl_manager', 'vl_coordinator'), getAllLabs);
router.post('/',      verifyToken, requireRole('admin', 'content_admin', 'vl_manager', 'vl_coordinator'), createLab);
router.post('/:id/update',    verifyToken, requireRole('admin', 'content_admin', 'vl_manager', 'vl_coordinator'), updateLab);
router.post('/:id/delete', verifyToken, requireRole('admin', 'content_admin', 'vl_manager', 'vl_coordinator'), deleteLab);

module.exports = router;
