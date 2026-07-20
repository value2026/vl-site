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
    const { name } = req.body;
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
    const { name, isActive } = req.body;

    const data = {};
    if (name) data.name = name.trim();
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

module.exports = { getInstitutions, createInstitution, updateInstitution };
