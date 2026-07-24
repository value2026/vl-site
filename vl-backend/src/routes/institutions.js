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

// Only admins and vl_managers can create or update institutions
router.post('/bulk', verifyToken, requireRole('admin', 'vl_manager'), require('../controllers/institutionsController').bulkCreateInstitutions);
router.post('/', verifyToken, requireRole('admin', 'vl_manager'), createInstitution);
router.put('/:id', verifyToken, requireRole('admin', 'vl_manager'), updateInstitution);
router.delete('/:id', verifyToken, requireRole('admin', 'vl_manager'), deleteInstitution);

module.exports = router;
