const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop
} = require('../controllers/workshopsController');

// Public endpoint for the frontend Workshop landing page
router.get('/', getWorkshops);
router.get('/:id', getWorkshopById);

router.use(verifyToken);

// Only admins and vl_managers can create workshops
router.post('/', requireRole('admin', 'vl_manager'), createWorkshop);

// Admins can update/approve, vl_managers can update their own (complex logic in controller)
router.put('/:id', requireRole('admin', 'vl_manager'), updateWorkshop);

router.delete('/:id', requireRole('admin', 'vl_manager'), deleteWorkshop);

module.exports = router;
