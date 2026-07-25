const prisma = require('../db');

// GET /api/subjects  (public — active only)
const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { labs: { where: { isActive: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/subjects/all  (admin — all, incl. inactive)
const getAllSubjects = async (_req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { labs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/subjects
const createSubject = async (req, res) => {
  try {
    const { title, icon, description, gradient } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const subject = await prisma.subject.create({
      data: {
        title: title.trim(),
        icon:        icon        || '📚',
        description: description || null,
        gradient:    gradient    || 'from-blue-600 to-indigo-700',
        createdById: req.user.id,
      },
    });
    res.status(201).json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, description, gradient, isActive } = req.body;
    const data = {};
    if (title       !== undefined) data.title       = title.trim();
    if (icon        !== undefined) data.icon        = icon;
    if (description !== undefined) data.description = description;
    if (gradient    !== undefined) data.gradient    = gradient;
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const subject = await prisma.subject.update({ where: { id }, data });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    // Safely remove child experiments and labs first to prevent FK constraint failure
    const labs = await prisma.lab.findMany({ where: { subjectId: id }, select: { id: true } });
    const labIds = labs.map(l => l.id);
    if (labIds.length > 0) {
      await prisma.experiment.deleteMany({ where: { labId: { in: labIds } } });
      await prisma.lab.deleteMany({ where: { subjectId: id } });
    }
    await prisma.subject.delete({ where: { id } });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

module.exports = { getSubjects, getAllSubjects, createSubject, updateSubject, deleteSubject };
