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
    const { name, code, collegeId, legacyId, oldCreatedAt } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Institution name is required' });
    }

    const exists = await prisma.institution.findUnique({
      where: { name: name.trim() }
    });

    if (exists) {
      return res.status(409).json({ message: 'Institution already exists' });
    }

    const cid = collegeId !== undefined && collegeId !== null && collegeId !== '' ? collegeId.toString().trim() : (legacyId !== undefined && legacyId !== null && legacyId !== '' ? legacyId.toString().trim() : null);
    let parsedLegacy = legacyId !== undefined && legacyId !== null && legacyId !== '' ? parseInt(legacyId, 10) : (cid && !isNaN(parseInt(cid, 10)) ? parseInt(cid, 10) : null);

    const institution = await prisma.institution.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        collegeId: cid || null,
        legacyId: !isNaN(parsedLegacy) ? parsedLegacy : null,
        oldCreatedAt: oldCreatedAt ? oldCreatedAt.trim() : null,
        createdById: req.user?.id || null
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
    const { name, code, collegeId, legacyId, oldCreatedAt, isActive } = req.body;

    const data = {};
    if (name) data.name = name.trim();
    if (code !== undefined) data.code = code ? code.trim() : null;
    if (collegeId !== undefined) {
      const cid = collegeId ? collegeId.toString().trim() : null;
      data.collegeId = cid;
      if (cid && !isNaN(parseInt(cid, 10))) {
        data.legacyId = parseInt(cid, 10);
      }
    } else if (legacyId !== undefined) {
      data.legacyId = legacyId ? parseInt(legacyId, 10) : null;
      if (data.legacyId) data.collegeId = data.legacyId.toString();
    }
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

// POST /api/institutions/bulk
const bulkCreateInstitutions = async (req, res) => {
  try {
    const { institutions } = req.body;
    if (!Array.isArray(institutions)) {
      return res.status(400).json({ message: 'Institutions list must be an array' });
    }

    // Clean and validate
    const validItems = [];
    const skippedItems = [];

    for (const item of institutions) {
      const name = item.name ? item.name.trim() : null;
      if (!name) {
        skippedItems.push({ item, reason: 'Name is missing or empty' });
        continue;
      }
      
      const code = item.code ? item.code.trim() : null;
      const oldCreatedAt = item.oldCreatedAt ? item.oldCreatedAt.toString().trim() : null;
      
      const cid = item.collegeId !== undefined && item.collegeId !== null && item.collegeId !== '' ? item.collegeId.toString().trim() : (item.legacyId !== undefined && item.legacyId !== null && item.legacyId !== '' ? item.legacyId.toString().trim() : null);
      let legacyId = null;
      if (item.legacyId !== undefined && item.legacyId !== null && item.legacyId !== '') {
        const parsed = parseInt(item.legacyId, 10);
        if (!isNaN(parsed)) {
          legacyId = parsed;
        }
      } else if (cid && !isNaN(parseInt(cid, 10))) {
        legacyId = parseInt(cid, 10);
      }

      validItems.push({
        name,
        code,
        collegeId: cid || null,
        legacyId,
        oldCreatedAt
      });
    }

    if (validItems.length === 0) {
      return res.status(400).json({
        message: 'No valid institutions found in request',
        createdCount: 0,
        skippedCount: skippedItems.length,
        skippedDetails: skippedItems
      });
    }

    // Find duplicates in database
    const namesToCheck = validItems.map(i => i.name);
    const existing = await prisma.institution.findMany({
      where: { name: { in: namesToCheck } },
      select: { name: true }
    });
    const existingNames = new Set(existing.map(e => e.name));

    // Filter out duplicates
    const finalItemsToInsert = [];
    for (const item of validItems) {
      if (existingNames.has(item.name)) {
        skippedItems.push({ item, reason: 'Institution name already exists in database' });
      } else {
        finalItemsToInsert.push({
          name: item.name,
          code: item.code,
          collegeId: item.collegeId,
          legacyId: item.legacyId,
          oldCreatedAt: item.oldCreatedAt,
          createdById: req.user?.id || null
        });
      }
    }

    let createdCount = 0;
    if (finalItemsToInsert.length > 0) {
      // Use createMany to insert in bulk
      const result = await prisma.institution.createMany({
        data: finalItemsToInsert,
        skipDuplicates: true
      });
      createdCount = result.count;
    }

    res.status(201).json({
      message: `Successfully processed ${institutions.length} rows. Created: ${createdCount}, Skipped: ${skippedItems.length}`,
      createdCount,
      skippedCount: skippedItems.length,
      skippedDetails: skippedItems
    });
  } catch (err) {
    console.error('Bulk create institutions error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getInstitutions, createInstitution, updateInstitution, deleteInstitution, bulkCreateInstitutions };
