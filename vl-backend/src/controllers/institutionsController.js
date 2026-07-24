const prisma = require('../db');

// GET /api/institutions
const getInstitutions = async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(institutions);
  } catch (err) {
    console.error('Get institutions error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/institutions
const createInstitution = async (req, res) => {
  try {
    const { name, code, legacyId, oldCreatedAt } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Institution name is required' });
    }

    const exists = await prisma.institution.findUnique({
      where: { name: name.trim() }
    });

    if (exists) {
      return res.status(409).json({ message: 'Institution already exists' });
    }

    const institution = await prisma.institution.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        legacyId: legacyId ? parseInt(legacyId, 10) : null,
        oldCreatedAt: oldCreatedAt ? oldCreatedAt.trim() : null,
        createdById: req.user.id
      }
    });

    res.status(201).json(institution);
  } catch (err) {
    console.error('Create institution error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/institutions/:id
const updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, legacyId, oldCreatedAt, isActive } = req.body;

    const data = {};
    if (name) data.name = name.trim();
    if (code !== undefined) data.code = code ? code.trim() : null;
    if (legacyId !== undefined) data.legacyId = legacyId ? parseInt(legacyId, 10) : null;
    if (oldCreatedAt !== undefined) data.oldCreatedAt = oldCreatedAt ? oldCreatedAt.trim() : null;
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const institution = await prisma.institution.update({
      where: { id },
      data
    });

    res.json(institution);
  } catch (err) {
    console.error('Update institution error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// DELETE /api/institutions/:id
const deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if institution exists
    const exists = await prisma.institution.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!exists) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Do not allow deletion if there are users associated with it, or maybe cascade delete? 
    // Usually we don't cascade delete institutions if they have users.
    if (exists._count.users > 0) {
      return res.status(400).json({ message: `Cannot delete institution because it has ${exists._count.users} users associated with it. Please reassign or delete the users first.` });
    }

    await prisma.institution.delete({
      where: { id }
    });

    res.json({ message: 'Institution deleted successfully' });
  } catch (err) {
    console.error('Delete institution error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getInstitutions, createInstitution, updateInstitution, deleteInstitution };
