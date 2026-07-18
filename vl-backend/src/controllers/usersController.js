const bcrypt           = require('bcryptjs');
const prisma           = require('../db');
const { sendWelcomeEmail } = require('../utils/mailer');

// Which roles each role is allowed to create
const CREATION_RULES = {
  admin:        ['admin', 'content_admin', 'nodal_centre', 'teacher', 'student'],
  content_admin:[],
  nodal_centre: ['teacher', 'student'],
  teacher:      [],
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
        org:          true,
        dept:         true,
        designation:  true,
        facultyDept:  true,
        facultyInst:  true,
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

// Helper function to generate a secure random password
const generateRandomPassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers   = '0123456789';
  const symbols   = '!@#$%^&*';
  const allChars  = lowercase + uppercase + numbers + symbols;

  let password = '';
  // Ensure at least one of each character type for basic strength
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest up to 10 characters
  for (let i = 0; i < 6; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// ── POST /api/users ────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { role: callerRole, id: callerId } = req.user;
    const { 
      name, email, role: newRole, nodalCentreId,
      username, mobile, profilePic, org, dept, course, yearSemester,
      country, state, city, studentId, batch, section,
      employeeId, designation, facultyDept, facultyInst
    } = req.body;

    // Validate required fields
    if (!name || !email || !newRole || !username || !org || !dept || !country) {
      return res.status(400).json({ 
        message: 'Missing required fields. Full Name, Username, Email, Organization/University, Department, and Country are required.' 
      });
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

    // Check username uniqueness
    if (username) {
      const usernameExists = await prisma.user.findFirst({
        where: { username: username.trim() }
      });
      if (usernameExists) {
        return res.status(409).json({ message: 'This username is already taken' });
      }
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

    // Autogenerate a secure password
    const plainTextPassword = generateRandomPassword();
    const hashed = await bcrypt.hash(plainTextPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        name:          name.trim(),
        email:         email.toLowerCase().trim(),
        password:      hashed,
        role:          newRole,
        createdById:   callerId,
        nodalCentreId: centreId,

        // Add additional common & academic fields
        username:      username.trim(),
        mobile:        mobile ? mobile.trim() : null,
        profilePic:    profilePic || null,
        org:           org.trim(),
        dept:          dept.trim(),
        course:        course ? course.trim() : null,
        yearSemester:  yearSemester ? yearSemester.trim() : null,
        country:       country.trim(),
        state:         state ? state.trim() : null,
        city:          city ? city.trim() : null,

        // Student-specific fields
        studentId:     newRole === 'student' && studentId ? studentId.trim() : null,
        batch:         newRole === 'student' && batch ? batch.trim() : null,
        section:       newRole === 'student' && section ? section.trim() : null,

        // Faculty-specific fields
        employeeId:    newRole === 'teacher' && employeeId ? employeeId.trim() : null,
        designation:   newRole === 'teacher' && designation ? designation.trim() : null,
        facultyDept:   newRole === 'teacher' && facultyDept ? facultyDept.trim() : null,
        facultyInst:   newRole === 'teacher' && facultyInst ? facultyInst.trim() : null,
      },
      select: {
        id:           true,
        name:         true,
        email:        true,
        role:         true,
        username:     true,
        isActive:     true,
        nodalCentreId: true,
        createdAt:    true,
        nodalCentre:  { select: { name: true } },
        createdBy:    { select: { name: true } },
      },
    });

    // Send welcome email in background
    sendWelcomeEmail(newUser, plainTextPassword).catch(err => {
      console.error('❌ Mailer error: Failed to dispatch welcome email inside createUser:', err);
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
      const [totalAdmins, totalContentAdmins, totalNodalCentres, totalTeachers, totalStudents] = await Promise.all([
        prisma.user.count({ where: { role: 'admin' } }),
        prisma.user.count({ where: { role: 'content_admin' } }),
        prisma.user.count({ where: { role: 'nodal_centre' } }),
        prisma.user.count({ where: { role: 'teacher' } }),
        prisma.user.count({ where: { role: 'student' } }),
      ]);
      res.json({ totalAdmins, totalContentAdmins, totalNodalCentres, totalTeachers, totalStudents });

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
      const { name, email } = student;
      let { username, password } = student;
      
      if (!name?.trim() || !email?.trim()) {
        skipped.push({ email: email || 'unknown', reason: 'Missing name or email' });
        continue;
      }

      const cleanEmail = email.toLowerCase().trim();

      // Check duplicate email
      const exists = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (exists) {
        skipped.push({ email: cleanEmail, reason: 'Email already registered' });
        continue;
      }

      // Resolve username
      if (!username || !username.trim()) {
        const emailPrefix = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '');
        // Check uniqueness of generated username
        let checkUsername = emailPrefix;
        let suffix = 1;
        while (true) {
          const userWithUsername = await prisma.user.findFirst({
            where: { username: checkUsername }
          });
          if (!userWithUsername) break;
          checkUsername = `${emailPrefix}${suffix}`;
          suffix++;
        }
        username = checkUsername;
      } else {
        username = username.trim();
        // Check duplicate username
        const usernameExists = await prisma.user.findFirst({
          where: { username }
        });
        if (usernameExists) {
          skipped.push({ email: cleanEmail, reason: `Username "${username}" is already taken` });
          continue;
        }
      }

      // Generate password if missing
      const plainTextPassword = (password && password.trim()) ? password.trim() : generateRandomPassword();
      const hashed = await bcrypt.hash(plainTextPassword, 12);

      const newStudent = await prisma.user.create({
        data: {
          name:          name.trim(),
          email:         cleanEmail,
          password:      hashed,
          role:          'student',
          createdById:   callerId,
          nodalCentreId: centreId,
          username,
          // Inherit caller academic details if available for helper defaults
          org:           student.org || req.user.org || 'Virtual Labs Partner',
          dept:          student.dept || req.user.dept || 'Science',
          country:       student.country || 'India',
        },
      });

      // Dispatch email in background
      sendWelcomeEmail(newStudent, plainTextPassword).catch(err => {
        console.error(`❌ Mailer error: Failed to send welcome email for bulk student ${cleanEmail}:`, err);
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
