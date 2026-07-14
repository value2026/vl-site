const bcrypt           = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Which roles each role is allowed to create
const CREATION_RULES = {
  admin:        ['admin', 'nodal_centre', 'teacher', 'student'],
  nodal_centre: ['teacher', 'student'],
  teacher:      ['student'],
  student:      [],
};

// ── GET /api/users ─────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { search = '', filterRole = '' } = req.query;

    const searchFilter = search
      ? {
          OR: [
            { name:  { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const roleFilter = filterRole ? { role: filterRole } : {};

    let where = {};

    if (role === 'admin') {
      where = { ...searchFilter, ...roleFilter };
    } else if (role === 'nodal_centre') {
      where = { nodalCentreId: id, ...searchFilter, ...roleFilter };
    } else if (role === 'teacher') {
      where = { createdById: id, role: 'student', ...searchFilter };
    } else {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id:           true,
        name:         true,
        email:        true,
        role:         true,
        isActive:     true,
        nodalCentreId: true,
        createdById:  true,
        createdAt:    true,
        nodalCentre:  { select: { name: true } },
        createdBy:    { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── POST /api/users ────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { role: callerRole, id: callerId } = req.user;
    const { name, email, password, role: newRole, nodalCentreId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !newRole) {
      return res.status(400).json({ message: 'name, email, password, and role are required' });
    }

    // Check caller can create this role
    if (!CREATION_RULES[callerRole]?.includes(newRole)) {
      return res.status(403).json({
        message: `You do not have permission to create a user with role "${newRole}"`,
      });
    }

    // Check email uniqueness
    const exists = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (exists) {
      return res.status(409).json({ message: 'This email address is already registered' });
    }

    // Determine which nodal centre to assign
    let centreId = nodalCentreId || null;
    if (callerRole === 'nodal_centre') {
      centreId = callerId; // always under the calling nodal centre
    } else if (callerRole === 'teacher') {
      // Inherit teacher's own nodal centre
      const teacher = await prisma.user.findUnique({
        where: { id: callerId },
        select: { nodalCentreId: true },
      });
      centreId = teacher?.nodalCentreId ?? null;
    }

    const hashed = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name:          name.trim(),
        email:         email.toLowerCase().trim(),
        password:      hashed,
        role:          newRole,
        createdById:   callerId,
        nodalCentreId: centreId,
      },
      select: {
        id:           true,
        name:         true,
        email:        true,
        role:         true,
        isActive:     true,
        nodalCentreId: true,
        createdAt:    true,
        nodalCentre:  { select: { name: true } },
        createdBy:    { select: { name: true } },
      },
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── PUT /api/users/:id ─────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const { role: callerRole, id: callerId } = req.user;
    const { id: targetId } = req.params;
    const { name, email, password, isActive } = req.body;

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Permission check
    if (callerRole !== 'admin') {
      if (callerRole === 'nodal_centre' && target.nodalCentreId !== callerId) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      if (callerRole === 'teacher' && target.createdById !== callerId) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }

    const data = {};
    if (name)                       data.name     = name.trim();
    if (email)                      data.email    = email.toLowerCase().trim();
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (password)                   data.password = await bcrypt.hash(password, 12);

    const updated = await prisma.user.update({
      where: { id: targetId },
      data,
      select: {
        id: true, name: true, email: true,
        role: true, isActive: true, createdAt: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── DELETE /api/users/:id ──────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { role: callerRole, id: callerId } = req.user;
    const { id: targetId } = req.params;

    if (targetId === callerId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Permission check
    if (callerRole !== 'admin') {
      if (callerRole === 'nodal_centre' && target.nodalCentreId !== callerId) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      if (callerRole === 'teacher' && target.createdById !== callerId) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }

    await prisma.user.delete({ where: { id: targetId } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/users/stats ───────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const { role, id } = req.user;

    if (role === 'admin') {
      const [totalAdmins, totalNodalCentres, totalTeachers, totalStudents] = await Promise.all([
        prisma.user.count({ where: { role: 'admin' } }),
        prisma.user.count({ where: { role: 'nodal_centre' } }),
        prisma.user.count({ where: { role: 'teacher' } }),
        prisma.user.count({ where: { role: 'student' } }),
      ]);
      res.json({ totalAdmins, totalNodalCentres, totalTeachers, totalStudents });

    } else if (role === 'nodal_centre') {
      const [totalTeachers, totalStudents] = await Promise.all([
        prisma.user.count({ where: { nodalCentreId: id, role: 'teacher' } }),
        prisma.user.count({ where: { nodalCentreId: id, role: 'student' } }),
      ]);
      res.json({ totalTeachers, totalStudents });

    } else if (role === 'teacher') {
      const totalStudents = await prisma.user.count({
        where: { createdById: id, role: 'student' },
      });
      res.json({ totalStudents });

    } else {
      res.json({});
    }
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── POST /api/users/bulk ───────────────────────────────────────
const bulkCreateStudents = async (req, res) => {
  try {
    const { role: callerRole, id: callerId } = req.user;
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'students must be a non-empty array' });
    }

    // Only Admin, Nodal Centre, and Teacher can bulk add students
    if (!['admin', 'nodal_centre', 'teacher'].includes(callerRole)) {
      return res.status(403).json({ message: 'Insufficient permissions to bulk add users' });
    }

    // Nodal centre id resolution
    let centreId = null;
    if (callerRole === 'nodal_centre') {
      centreId = callerId;
    } else if (callerRole === 'teacher') {
      const teacher = await prisma.user.findUnique({
        where: { id: callerId },
        select: { nodalCentreId: true },
      });
      centreId = teacher?.nodalCentreId ?? null;
    }

    let createdCount = 0;
    const skipped = [];

    // Parallel hashing/insertion or sequential
    for (const student of students) {
      const { name, email, password } = student;
      
      if (!name?.trim() || !email?.trim() || !password?.trim()) {
        skipped.push({ email: email || 'unknown', reason: 'Missing name, email, or password' });
        continue;
      }

      const cleanEmail = email.toLowerCase().trim();

      // Check duplicate
      const exists = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (exists) {
        skipped.push({ email: cleanEmail, reason: 'Email already registered' });
        continue;
      }

      const hashed = await bcrypt.hash(password.trim(), 12);

      await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: hashed,
          role: 'student',
          createdById: callerId,
          nodalCentreId: centreId,
        },
      });
      createdCount++;
    }

    res.status(200).json({
      message: `Successfully registered ${createdCount} students`,
      createdCount,
      skippedCount: skipped.length,
      skipped,
    });
  } catch (err) {
    console.error('Bulk create error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getStats, bulkCreateStudents };
