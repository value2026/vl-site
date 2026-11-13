const express = require('express');
const router  = express.Router();
const { verifyToken, forbidRoles } = require('../middleware/auth');
const {
  getChatHistory,
  scheduleCall,
  getScheduledCalls,
  updateScheduledCallStatus,
  getContacts
} = require('../controllers/callsController');

// All communication routes require JWT authorization and exclude guest sessions
router.use(verifyToken);
router.use(forbidRoles('guest'));

router.get('/contacts', getContacts);
router.get('/chat/:peerId', getChatHistory);
router.post('/schedule', scheduleCall);
router.get('/scheduled', getScheduledCalls);
router.post('/schedule/:id/update', updateScheduledCallStatus);

module.exports = router;
