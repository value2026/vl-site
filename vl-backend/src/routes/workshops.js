const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getWorkshops,
  createWorkshop,
  updateWorkshop
} = require('../controllers/workshopsController');

router.use(verifyToken);

// All logged in users can view workshops
router.get('/', getWorkshops);

// Only admins and vl_managers can create workshops
router.post('/', requireRole('admin', 'vl_manager'), createWorkshop);

// Admins can update/approve, vl_managers can update their own (complex logic in controller)
router.put('/:id', requireRole('admin', 'vl_manager'), updateWorkshop);

module.exports = router;
