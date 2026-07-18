const express = require('express');
const router  = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getStats, bulkCreateStudents } =
  require('../controllers/usersController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All user routes require a valid JWT
router.use(verifyToken);

router.get('/stats', requireRole('admin', 'nodal_centre', 'teacher'), getStats);
router.get('/',      requireRole('admin', 'nodal_centre', 'teacher'), getUsers);
router.post('/',     requireRole('admin', 'nodal_centre', 'teacher'), createUser);
router.post('/bulk', requireRole('admin', 'nodal_centre', 'teacher'), bulkCreateStudents);
router.put('/:id',   requireRole('admin', 'nodal_centre', 'teacher'), updateUser);
router.delete('/:id', requireRole('admin', 'nodal_centre', 'teacher'), deleteUser);

module.exports = router;
