const prisma = require('../db');

// ── GET CHAT HISTORY ──────────────────────────────────────────
const getChatHistory = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { peerId } = req.params;

    const chatLogs = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: peerId },
          { senderId: peerId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(chatLogs);
  } catch (err) {
    console.error('Get chat logs error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── SCHEDULE CALL (multi-invitee) ─────────────────────────────
// POST /api/calls/schedule
// Body: { title, description, scheduledAt, duration, inviteeIds: string[] }
const scheduleCall = async (req, res) => {
  try {
    const { id: hostId } = req.user;
    const { title, description, scheduledAt, duration, inviteeIds } = req.body;

    if (!title || !scheduledAt || !duration || !Array.isArray(inviteeIds) || inviteeIds.length === 0) {
      return res.status(400).json({ message: 'title, scheduledAt, duration, and at least one inviteeId are required' });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduledAt date format' });
    }

    // Deduplicate and exclude host
    const uniqueInviteeIds = [...new Set(inviteeIds)].filter(id => id !== hostId);
    if (uniqueInviteeIds.length === 0) {
      return res.status(400).json({ message: 'Must invite at least one other participant' });
    }

    const callObj = await prisma.scheduledCall.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        scheduledAt: scheduledDate,
        duration: parseInt(duration, 10),
        hostId,
        invitees: {
          create: uniqueInviteeIds.map(uid => ({ userId: uid, status: 'pending' }))
        }
      },
      include: {
        host: { select: { id: true, name: true, email: true, role: true } },
        invitees: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      }
    });

    res.status(201).json(callObj);
  } catch (err) {
    console.error('Schedule call error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET SCHEDULED CALLS ───────────────────────────────────────
const getScheduledCalls = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const calls = await prisma.scheduledCall.findMany({
      where: {
        OR: [
          { hostId: userId },
          { invitees: { some: { userId } } }
        ]
      },
      include: {
        host: { select: { id: true, name: true, email: true, role: true } },
        invitees: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json(calls);
  } catch (err) {
    console.error('Get scheduled calls error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── UPDATE INVITEE STATUS ─────────────────────────────────────
// PUT /api/calls/schedule/:id  — updates THIS user's own invitee row
const updateScheduledCallStatus = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: scheduledCallId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "accepted" or "declined"' });
    }

    const inviteeRecord = await prisma.scheduledCallInvitee.findUnique({
      where: { scheduledCallId_userId: { scheduledCallId, userId } }
    });

    if (!inviteeRecord) {
      return res.status(404).json({ message: 'Invitation not found for this user' });
    }

    const updated = await prisma.scheduledCallInvitee.update({
      where: { id: inviteeRecord.id },
      data: { status }
    });

    res.json(updated);
  } catch (err) {
    console.error('Update call status error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET CONTACTS ──────────────────────────────────────────────
const getContacts = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    // Fetch full user record from DB (JWT only carries limited fields)
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, nodalCentreId: true, createdById: true }
    });

    let whereClause = {};

    if (role === 'student') {
      // Students see: the person who created them + their nodal centre + all admins
      const orConditions = [{ role: 'admin' }];
      if (me.createdById)   orConditions.push({ id: me.createdById });
      if (me.nodalCentreId) orConditions.push({ id: me.nodalCentreId });
      // Fallback if no specific links — show all teachers and nodal centres
      if (orConditions.length === 1) {
        orConditions.push({ role: 'teacher' });
        orConditions.push({ role: 'nodal_centre' });
      }
      whereClause = { OR: orConditions };

    } else if (role === 'teacher') {
      // Teachers see: all admins + all nodal centres + students they created
      const orConditions = [
        { role: 'admin' },
        { role: 'nodal_centre' },
        { createdById: userId }   // students this teacher registered
      ];
      if (me.nodalCentreId) orConditions.push({ id: me.nodalCentreId });
      whereClause = { OR: orConditions };

    } else if (role === 'nodal_centre') {
      // Nodal centres see: all admins + all users under them
      whereClause = {
        OR: [
          { role: 'admin' },
          { nodalCentreId: userId },
          { createdById: userId }
        ]
      };

    } else if (role === 'admin') {
      // Admin sees everyone
      whereClause = {};
    }

    const contacts = await prisma.user.findMany({
      where: {
        ...whereClause,
        id: { not: userId },
        isActive: true
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }]
    });

    res.json(contacts);
  } catch (err) {
    console.error('Get contacts list error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getChatHistory,
  scheduleCall,
  getScheduledCalls,
  updateScheduledCallStatus,
  getContacts
};
