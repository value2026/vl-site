const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getChatHistory,
  scheduleCall,
  getScheduledCalls,
  updateScheduledCallStatus,
  getContacts
} = require('../controllers/callsController');

// All communication routes require JWT authorization
router.use(verifyToken);

router.get('/contacts', getContacts);
router.get('/chat/:peerId', getChatHistory);
router.post('/schedule', scheduleCall);
router.get('/scheduled', getScheduledCalls);
router.put('/schedule/:id', updateScheduledCallStatus);

module.exports = router;
