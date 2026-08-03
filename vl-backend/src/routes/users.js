const express = require('express');
const router  = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getStats, bulkCreateStudents } =
  require('../controllers/usersController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All user routes require a valid JWT
router.use(verifyToken);

router.get('/stats', requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getStats);
router.get('/',      requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), getUsers);
router.post('/',     requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), createUser);
router.post('/bulk', requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), bulkCreateStudents);
router.post('/:id/update',   updateUser); // any logged in user can update their own profile
router.post('/:id/delete', requireRole('admin', 'vl_manager', 'vl_coordinator', 'nodal_centre', 'teacher'), deleteUser);

module.exports = router;
