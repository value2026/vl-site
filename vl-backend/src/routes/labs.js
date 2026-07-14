const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getLabs, getAllLabs, createLab, updateLab, deleteLab,
} = require('../controllers/labsController');

// Public
router.get('/', getLabs);

// Authenticated
router.get('/all',    verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), getAllLabs);
router.post('/',      verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), createLab);
router.put('/:id',    verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), updateLab);
router.delete('/:id', verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), deleteLab);

module.exports = router;
