const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution
} = require('../controllers/institutionsController');

// Public route for registration dropdown
router.get('/', getInstitutions);

// Only admins, vl_managers, and vl_coordinators can create or update institutions
router.post('/bulk', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), require('../controllers/institutionsController').bulkCreateInstitutions);
router.post('/', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), createInstitution);
router.post('/:id/update', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), updateInstitution);
router.post('/:id/delete', verifyToken, requireRole('admin', 'vl_manager', 'vl_coordinator'), deleteInstitution);

module.exports = router;
