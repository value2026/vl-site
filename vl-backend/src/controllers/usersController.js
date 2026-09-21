const bcrypt           = require('bcryptjs');
const prisma           = require('../db');
const { sendWelcomeEmail, sendEmailVerificationOtp } = require('../utils/mailer');

// Store pending email updates in memory: targetId -> { email, otp, expiresAt }
const emailUpdateOtps = new Map();

// Helper to clean up expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of emailUpdateOtps.entries()) {
    if (value.expiresAt < now) emailUpdateOtps.delete(key);
  }
}, 60 * 60 * 1000);

// Which roles each role is allowed to create
const CREATION_RULES = {
  admin:        ['admin', 'nodal_centre', 'teacher', 'student', 'content_admin', 'sim_admin', 'vl_manager', 'vl_coordinator'],
  vl_manager:   ['nodal_centre', 'teacher', 'student', 'vl_coordinator'],
  vl_coordinator: ['nodal_centre', 'teacher', 'student'],
  nodal_centre: [],
  teacher:      ['student'],
  student:      [],
};

const ROLE_DEFAULT_PERMISSIONS = {
  nodal_centre:  ['manage_users'],
  vl_manager:    ['manage_users', 'manage_content', 'manage_simulations', 'manage_institutions', 'manage_workshops'],
  vl_coordinator:['manage_users', 'manage_content', 'manage_simulations', 'manage_institutions', 'manage_workshops'],
  teacher:       [],
  student:       [],
  admin:         [],
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
    } else if (role === 'vl_manager') {
      where = { ...searchFilter, ...roleFilter };
      // Prevent VL Managers from viewing admins and other VL managers
      if (filterRole === 'admin' || filterRole === 'vl_manager') {
        return res.json([]);
      } else if (!filterRole) {
        where.role = { notIn: ['admin', 'vl_manager'] };
      }
    } else if (role === 'vl_coordinator') {
      where = { createdById: id, ...searchFilter, ...roleFilter };
    } else if (role === 'nodal_centre') {
      const nodalAdmin = await prisma.user.findUnique({ where: { id }, select: { nodalCentreId: true } });
      if (nodalAdmin?.nodalCentreId) {
        where = { nodalCentreId: nodalAdmin.nodalCentreId, ...searchFilter, ...roleFilter };
      } else {
        where = { createdById: id, ...searchFilter, ...roleFilter };
      }
    } else if (role === 'teacher') {
      const teacher = await prisma.user.findUnique({ where: { id }, select: { nodalCentreId: true } });
      if (teacher?.nodalCentreId) {
        where = { nodalCentreId: teacher.nodalCentreId, role: 'student', ...searchFilter };
      } else {
        where = { createdById: id, role: 'student', ...searchFilter };
      }
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
        customPermissions: true,
        managedSubjectIds: true,
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
    if (!name || !email || !newRole || !username) {
      return res.status(400).json({ 
        message: 'Missing required fields. Full Name, Username, Email, and User Type are required.' 
      });
    }

    if (newRole === 'teacher' && (!dept || !dept.trim())) {
      return res.status(400).json({
        message: 'Department is required for Faculty/Instructors.'
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
      const nodalAdmin = await prisma.user.findUnique({
        where: { id: callerId },
        select: { nodalCentreId: true },
      });
      centreId = nodalAdmin?.nodalCentreId ?? null;
    } else if (callerRole === 'teacher') {
      // Inherit teacher's own nodal centre
      const teacher = await prisma.user.findUnique({
        where: { id: callerId },
        select: { nodalCentreId: true },
      });
      centreId = teacher?.nodalCentreId ?? null;
    }

    if ((callerRole === 'admin' || callerRole === 'vl_manager') && ['student', 'teacher', 'nodal_centre', 'vl_coordinator'].includes(newRole)) {
      if (!centreId) {
        return res.status(400).json({ message: 'Institution (Nodal Centre) is required.' });
      }
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
        org:           org ? org.trim() : (newRole === 'student' ? 'Virtual Labs Partner' : null),
        dept:          dept ? dept.trim() : (newRole === 'student' ? 'Science' : null),
        course:        course ? course.trim() : null,
        yearSemester:  yearSemester ? yearSemester.trim() : null,
        country:       country ? country.trim() : 'India',
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
        customPermissions: (Array.isArray(req.body.customPermissions) && req.body.customPermissions.length > 0)
          ? req.body.customPermissions
          : (ROLE_DEFAULT_PERMISSIONS[newRole] || []),
        managedSubjectIds: req.body.managedSubjectIds ? req.body.managedSubjectIds : [],
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
        customPermissions: true,
        managedSubjectIds: true,
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
    const { name, email, password, isActive, customPermissions, managedSubjectIds, otp } = req.body;

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Permission check — self-edit always allowed; otherwise scope-check
    if (callerId !== targetId && callerRole !== 'admin') {
      if (callerRole === 'vl_manager') {
        if (target.role === 'admin' || target.role === 'vl_manager') {
          return res.status(403).json({ message: 'VL Managers cannot edit admins or other managers' });
        }
      } else if (callerRole === 'vl_coordinator') {
         if (target.role === 'admin' || target.role === 'vl_manager' || target.role === 'vl_coordinator') {
            return res.status(403).json({ message: 'Insufficient permissions to update higher-level roles' });
         }
      } else {
        const caller = await prisma.user.findUnique({
          where: { id: callerId },
          select: { nodalCentreId: true },
        });

        if (callerRole === 'nodal_centre') {
          if (!caller?.nodalCentreId || target.nodalCentreId !== caller.nodalCentreId) {
            return res.status(403).json({ message: 'Insufficient permissions' });
          }
        } else if (callerRole === 'teacher') {
          if (target.nodalCentreId !== caller?.nodalCentreId) {
            return res.status(403).json({ message: 'Insufficient permissions' });
          }
        } else {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }
    }

    const data = {};
    if (name)                       data.name     = name.trim();
    
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== target.email) {
        // If email is changing, we require OTP verification ONLY if they are updating their own profile
        if (callerId === targetId && !otp) {
          const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
          if (exists) {
            return res.status(409).json({ message: 'This email address is already registered' });
          }
          
          const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
          emailUpdateOtps.set(targetId, {
            email: cleanEmail,
            otp: generatedOtp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
          });
          
          await sendEmailVerificationOtp(cleanEmail, target.name || name || 'User', generatedOtp);
          
          return res.status(200).json({ 
            message: 'An OTP has been sent to your new email address for verification.',
            requiresOtp: true
          });
        } else if (callerId === targetId) {
          // Verify OTP
          const pendingUpdate = emailUpdateOtps.get(targetId);
          if (!pendingUpdate || pendingUpdate.email !== cleanEmail || pendingUpdate.otp !== otp || pendingUpdate.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
          }
          // OTP is valid
          data.email = cleanEmail;
          emailUpdateOtps.delete(targetId);
        } else {
          // Admin/Manager updating another user's email, no OTP required
          data.email = cleanEmail;
        }
      }
    }
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (password)                   data.password = await bcrypt.hash(password, 12);
    if (customPermissions)          data.customPermissions = customPermissions;
    if (managedSubjectIds)          data.managedSubjectIds = managedSubjectIds;

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
    if (callerRole !== 'admin' && callerRole !== 'vl_manager' && callerRole !== 'vl_coordinator') {
      return res.status(403).json({ message: 'Only administrators, VL Managers, and Co-ordinators can delete users' });
    }
    
    if (callerRole === 'vl_manager' && (target.role === 'admin' || target.role === 'vl_manager')) {
      return res.status(403).json({ message: 'VL Managers cannot delete admins or other managers' });
    }

    if (callerRole === 'vl_coordinator' && (target.role === 'admin' || target.role === 'vl_manager' || target.role === 'vl_coordinator')) {
      return res.status(403).json({ message: 'Co-ordinators cannot delete admins or managers' });
    }

    await prisma.user.delete({ where: { id: targetId } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    if (err.code === 'P2003') {
      return res.status(400).json({ message: 'Cannot delete user because they are linked to existing records (like workshops). Please remove those records first.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/users/stats ───────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const { role, id } = req.user;

    if (role === 'admin' || role === 'vl_manager') {
      const [totalAdmins, totalNodalCentres, totalTeachers, totalStudents] = await Promise.all([
        prisma.user.count({ where: { role: 'admin' } }),
        prisma.user.count({ where: { role: 'nodal_centre' } }),
        prisma.user.count({ where: { role: 'teacher' } }),
        prisma.user.count({ where: { role: 'student' } }),
      ]);
      res.json({ totalAdmins, totalNodalCentres, totalTeachers, totalStudents });

    } else if (role === 'vl_coordinator') {
      const [totalNodalCentres, totalTeachers, totalStudents] = await Promise.all([
        prisma.user.count({ where: { createdById: id, role: 'nodal_centre' } }),
        prisma.user.count({ where: { createdById: id, role: 'teacher' } }),
        prisma.user.count({ where: { createdById: id, role: 'student' } }),
      ]);
      res.json({ totalNodalCentres, totalTeachers, totalStudents });

    } else if (role === 'nodal_centre') {
      const nodalAdmin = await prisma.user.findUnique({ where: { id }, select: { nodalCentreId: true } });
      let whereTeacher = { createdById: id, role: 'teacher' };
      let whereStudent = { createdById: id, role: 'student' };
      
      if (nodalAdmin?.nodalCentreId) {
        whereTeacher = { nodalCentreId: nodalAdmin.nodalCentreId, role: 'teacher' };
        whereStudent = { nodalCentreId: nodalAdmin.nodalCentreId, role: 'student' };
      }

      const [totalTeachers, totalStudents] = await Promise.all([
        prisma.user.count({ where: whereTeacher }),
        prisma.user.count({ where: whereStudent }),
      ]);
      res.json({ totalTeachers, totalStudents });

    } else if (role === 'teacher') {
      const teacher = await prisma.user.findUnique({ where: { id }, select: { nodalCentreId: true } });
      let whereClause = { createdById: id, role: 'student' };
      if (teacher?.nodalCentreId) {
        whereClause = { nodalCentreId: teacher.nodalCentreId, role: 'student' };
      }
      const totalStudents = await prisma.user.count({
        where: whereClause,
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
    const { students, nodalCentreId, sendEmails = false, isMigration = false } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'students must be a non-empty array' });
    }

    // Only Admin, VL Manager, Co-ordinator, and Teacher can bulk add students
    if (!['admin', 'vl_manager', 'vl_coordinator', 'teacher', 'nodal_centre'].includes(callerRole)) {
      return res.status(403).json({ message: 'Insufficient permissions to bulk add users' });
    }

    // Nodal centre id resolution
    let defaultCentreId = null;
    if (callerRole === 'nodal_centre') {
      const nodalAdmin = await prisma.user.findUnique({
        where: { id: callerId },
        select: { nodalCentreId: true },
      });
      defaultCentreId = nodalAdmin?.nodalCentreId ?? null;
    } else if (callerRole === 'teacher') {
      const teacher = await prisma.user.findUnique({
        where: { id: callerId },
        select: { nodalCentreId: true },
      });
      defaultCentreId = teacher?.nodalCentreId ?? null;
    } else if (callerRole === 'admin' || callerRole === 'vl_manager' || callerRole === 'vl_coordinator') {
      defaultCentreId = nodalCentreId || null;
    }

    // Cache institution collegeId map for fast lookup
    const allInstitutions = await prisma.institution.findMany({
      select: { id: true, collegeId: true }
    });
    const collegeIdMap = new Map();
    allInstitutions.forEach(inst => {
      if (inst.collegeId) {
        collegeIdMap.set(String(inst.collegeId).trim(), inst.id);
      }
    });

    const skipped = [];
    const batchToInsert = [];

    // Process students batch
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      let { name, email, username, password, schoolId, collegeId } = student;
      
      if (!name?.trim() || !email?.trim()) {
        skipped.push({ email: email || 'unknown', reason: 'Missing required name or email' });
        continue;
      }

      const cleanEmail = email.toLowerCase().trim();

      // Resolve username
      let finalUsername = username ? username.trim() : cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '');
      if (!finalUsername) {
        finalUsername = `user_${Math.random().toString(36).substring(2, 8)}`;
      }

      // Resolve Nodal Centre ID
      const targetSchoolId = schoolId || collegeId || student['School id'] || student['College ID'];
      let targetCentreId = defaultCentreId;
      if (targetSchoolId && collegeIdMap.has(String(targetSchoolId).trim())) {
        targetCentreId = collegeIdMap.get(String(targetSchoolId).trim());
      }

      // Password handling
      const rawPassword = (password && String(password).trim()) ? String(password).trim() : generateRandomPassword();
      let hashedPassword;

      // Check if password is already a bcrypt hash (starts with $2a$, $2b$, $2y$)
      if (/^\$2[aby]\$/.test(rawPassword)) {
        hashedPassword = rawPassword;
      } else {
        // Fast hashing
        hashedPassword = await bcrypt.hash(rawPassword, 10);
      }

      batchToInsert.push({
        name:          name.trim(),
        email:         cleanEmail,
        password:      hashedPassword,
        role:          'student',
        createdById:   callerId,
        nodalCentreId: targetCentreId,
        username:      finalUsername,
        org:           student.org || req.user.org || 'Virtual Labs Partner',
        dept:          student.dept || req.user.dept || 'Science',
        country:       student.country || 'India',
        course:        student.course || null,
        yearSemester:  student.yearSemester || null,
        batch:         student.batch || null,
        studentId:     student.studentId || null,
        section:       student.section ? String(student.section).trim() : null,
        mobile:        student.mobile || null,
        // Save unhashed password strictly if email sending is enabled for NEW users, otherwise ignored
        _plainPassword: rawPassword,
      });
    }

    let totalInserted = 0;

    if (batchToInsert.length > 0) {
      // Prepare array for createMany (strip temporary fields)
      const dataForDb = batchToInsert.map(({ _plainPassword, ...userObj }) => userObj);

      try {
        const result = await prisma.user.createMany({
          data: dataForDb,
          skipDuplicates: true,
        });
        totalInserted = result.count;
      } catch (dbErr) {
        console.error('❌ Batch insertion error:', dbErr.message);
        // Fallback to row-by-row if createMany has schema issues
        for (const item of dataForDb) {
          try {
            await prisma.user.create({ data: item });
            totalInserted++;
          } catch (e) {
            skipped.push({ email: item.email, reason: e.message });
          }
        }
      }

      // STRICT CHECK: Send welcome emails ONLY if sendEmails is true AND NOT in migration mode
      if (sendEmails && !isMigration) {
        // Send welcome emails in background for new users
        for (const item of batchToInsert) {
          sendWelcomeEmail(item, item._plainPassword).catch(err => {
            console.error(`❌ Mailer error for ${item.email}:`, err.message);
          });
        }
      }
    }

    const totalSkippedInBatch = Math.max(0, students.length - totalInserted);

    res.status(200).json({
      message: `Processed ${students.length} rows. Inserted ${totalInserted} new users.`,
      createdCount: totalInserted,
      skippedCount: skipped.length + totalSkippedInBatch,
      skipped,
    });
  } catch (err) {
    console.error('Bulk create error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getStats, bulkCreateStudents };
