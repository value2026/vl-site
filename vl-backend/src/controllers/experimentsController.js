const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs   = require('fs');
const { extractZip, uploadsPath, UPLOADS_DIR } = require('../middleware/upload');

const prisma = new PrismaClient();

// HTML section file names (returned as raw HTML)
const HTML_SECTIONS = ['aim', 'theory', 'procedure'];
// JSON section file names (returned as parsed JSON)
const JSON_SECTIONS = ['pretest', 'posttest', 'references', 'contributors'];

// GET /api/experiments?labId=   (public — active only)
const getExperiments = async (req, res) => {
  try {
    const { labId } = req.query;
    const where = { isActive: true };
    if (labId) where.labId = labId;

    const experiments = await prisma.experiment.findMany({
      where,
      include: {
        lab: { select: { title: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/experiments/all?labId=   (staff — all)
const getAllExperiments = async (req, res) => {
  try {
    const { labId } = req.query;
    const where = {};
    if (labId) where.labId = labId;

    if (req.user.role === 'teacher')      where.createdById = req.user.id;
    else if (req.user.role === 'nodal_centre') {
      // Get labs owned by this nodal centre
      const labs = await prisma.lab.findMany({
        where: { nodalCentreId: req.user.id },
        select: { id: true },
      });
      where.labId = { in: labs.map((l) => l.id) };
    }

    const experiments = await prisma.experiment.findMany({
      where,
      include: {
        lab: { select: { title: true, subject: { select: { title: true } } } },
        createdBy: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/experiments/:id   (public)
const getExperiment = async (req, res) => {
  try {
    const exp = await prisma.experiment.findUnique({
      where: { id: req.params.id },
      include: {
        lab: { select: { title: true, subject: { select: { title: true, id: true, gradient: true } } } },
        createdBy: { select: { name: true } },
      },
    });
    if (!exp) return res.status(404).json({ message: 'Experiment not found' });
    res.json(exp);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/experiments/:id/content/:section   (public)
const getExperimentSection = async (req, res) => {
  try {
    const { id, section } = req.params;
    const allSections = [...HTML_SECTIONS, ...JSON_SECTIONS];
    if (!allSections.includes(section)) {
      return res.status(400).json({ message: `Unknown section: ${section}` });
    }

    const exp = await prisma.experiment.findUnique({ where: { id } });
    if (!exp) return res.status(404).json({ message: 'Experiment not found' });
    if (!exp.contentPath) return res.status(404).json({ message: 'Content not uploaded yet' });

    const ext  = JSON_SECTIONS.includes(section) ? 'json' : 'html';
    const file = path.join(UPLOADS_DIR, exp.contentPath, `${section}.${ext}`);

    if (!fs.existsSync(file)) {
      return res.status(404).json({ message: `Section "${section}" not found in content zip` });
    }

    const raw = fs.readFileSync(file, 'utf-8');
    if (ext === 'json') {
      return res.json(JSON.parse(raw));
    }
    res.type('text/html').send(raw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/experiments
const createExperiment = async (req, res) => {
  try {
    const { title, description, duration, difficulty, labId } = req.body;
    if (!title || !labId) {
      return res.status(400).json({ message: 'Title and lab are required' });
    }

    const exp = await prisma.experiment.create({
      data: {
        title:       title.trim(),
        description: description || null,
        duration:    duration    || '60 min',
        difficulty:  difficulty  || 'Beginner',
        labId,
        createdById: req.user.id,
      },
      include: { lab: { select: { title: true } } },
    });
    res.status(201).json(exp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/experiments/:id
const updateExperiment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, difficulty, isActive } = req.body;

    if (req.user.role !== 'admin') {
      const exp = await prisma.experiment.findUnique({ where: { id } });
      if (!exp || exp.createdById !== req.user.id) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }

    const data = {};
    if (title       !== undefined) data.title       = title.trim();
    if (description !== undefined) data.description = description;
    if (duration    !== undefined) data.duration    = duration;
    if (difficulty  !== undefined) data.difficulty  = difficulty;
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const exp = await prisma.experiment.update({ where: { id }, data });
    res.json(exp);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/experiments/:id
const deleteExperiment = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      const exp = await prisma.experiment.findUnique({ where: { id } });
      if (!exp || exp.createdById !== req.user.id) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }

    await prisma.experiment.delete({ where: { id } });
    res.json({ message: 'Experiment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/experiments/:id/upload-content   (admin, nodal_centre)
const uploadContent = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { id } = req.params;
    const targetDir   = `experiments/${id}/content`;
    const absoluteDir = uploadsPath('experiments', id, 'content');

    extractZip(req.file.path, absoluteDir);

    await prisma.experiment.update({
      where: { id },
      data: { contentPath: targetDir },
    });
    res.json({ message: 'Content uploaded and extracted successfully', contentPath: targetDir });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
};

// POST /api/experiments/:id/upload-simulation   (admin, nodal_centre, teacher)
const uploadSimulation = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { id } = req.params;
    const targetDir   = `experiments/${id}/simulation`;
    const absoluteDir = uploadsPath('experiments', id, 'simulation');

    extractZip(req.file.path, absoluteDir);

    await prisma.experiment.update({
      where: { id },
      data: { simulationPath: targetDir },
    });
    res.json({ message: 'Simulation uploaded and extracted successfully', simulationPath: targetDir });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
};

module.exports = {
  getExperiments, getAllExperiments, getExperiment, getExperimentSection,
  createExperiment, updateExperiment, deleteExperiment,
  uploadContent, uploadSimulation,
};
