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

// Only admins, vl_managers, and vl_coordinators can create workshops
router.post('/', requireRole('admin', 'vl_manager', 'vl_coordinator'), createWorkshop);

// Admins/vl_managers can update/approve, vl_coordinators can update their own
router.post('/:id/update', requireRole('admin', 'vl_manager', 'vl_coordinator'), updateWorkshop);

router.post('/:id/delete', requireRole('admin', 'vl_manager', 'vl_coordinator'), deleteWorkshop);

module.exports = router;
