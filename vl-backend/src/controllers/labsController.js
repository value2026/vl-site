const prisma = require('../db');

// GET /api/labs?subjectId=  (public — active only)
const getLabs = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const where = { isActive: true };
    if (subjectId) where.subjectId = subjectId;

    const labs = await prisma.lab.findMany({
      where,
      include: {
        subject: { select: { title: true, gradient: true, icon: true } },
        _count: { select: { experiments: { where: { isActive: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(labs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/labs/all?subjectId=  (admin/nodal/teacher — all)
const getAllLabs = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const where = {};
    if (subjectId) where.subjectId = subjectId;

    // Non-admin: only see their own labs
    if (req.user.role === 'teacher') {
      where.createdById = req.user.id;
    } else if (req.user.role === 'nodal_centre') {
      where.nodalCentreId = req.user.id;
    }

    const labs = await prisma.lab.findMany({
      where,
      include: {
        subject: { select: { title: true, icon: true } },
        createdBy: { select: { name: true, role: true } },
        _count: { select: { experiments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(labs);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/labs
const createLab = async (req, res) => {
  try {
    const { title, description, icon, subjectId, coverPic } = req.body;
    if (!title || !subjectId) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    // Determine nodalCentreId from creator role
    let nodalCentreId = null;
    if (req.user.role === 'nodal_centre') nodalCentreId = req.user.id;
    else if (req.user.role === 'teacher')  nodalCentreId = req.user.nodalCentreId;

    const lab = await prisma.lab.create({
      data: {
        title:        title.trim(),
        description:  description || null,
        icon:         icon        || '🔬',
        coverPic:     coverPic    || null,
        subjectId,
        createdById:  req.user.id,
        nodalCentreId,
      },
      include: { subject: { select: { title: true } } },
    });
    res.status(201).json(lab);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/labs/:id
const updateLab = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, isActive, coverPic, subjectId } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'vl_manager' && req.user.role !== 'content_admin') {
      const lab = await prisma.lab.findUnique({ where: { id } });
      if (!lab || lab.createdById !== req.user.id) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }

    const data = {};
    if (title       !== undefined) data.title       = title.trim();
    if (description !== undefined) data.description = description;
    if (icon        !== undefined) data.icon        = icon;
    if (coverPic    !== undefined) data.coverPic    = coverPic;
    if (subjectId   !== undefined) data.subjectId   = subjectId;
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const lab = await prisma.lab.update({ where: { id }, data });
    res.json(lab);
  } catch (err) {
    console.error('Update lab error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/labs/:id
const deleteLab = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'vl_manager' && req.user.role !== 'content_admin') {
      const lab = await prisma.lab.findUnique({ where: { id } });
      if (!lab || lab.createdById !== req.user.id) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }

    // Safely remove associated experiments first to prevent foreign key constraints error
    await prisma.experiment.deleteMany({ where: { labId: id } });
    await prisma.lab.delete({ where: { id } });
    res.json({ message: 'Lab deleted' });
  } catch (err) {
    console.error('Delete lab error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

module.exports = { getLabs, getAllLabs, createLab, updateLab, deleteLab };
