const prisma = require('../db');
const path = require('path');
const fs   = require('fs');
const { extractZip, uploadsPath, UPLOADS_DIR } = require('../middleware/upload');
const { compileSimulation } = require('../utils/simulationBuilder');
const { marked } = require('marked');

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
        lab: { select: { title: true, coverPic: true, subject: { select: { title: true } } } },
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
    const { title, description, duration, difficulty, labId, coverPic } = req.body;
    if (!title || !labId) {
      return res.status(400).json({ message: 'Title and lab are required' });
    }

    const exp = await prisma.experiment.create({
      data: {
        title:       title.trim(),
        description: description || null,
        duration:    duration    || '60 min',
        difficulty:  difficulty  || 'Beginner',
        coverPic:    coverPic    || null,
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
    const { title, description, duration, difficulty, isActive, coverPic } = req.body;

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
    if (coverPic    !== undefined) data.coverPic    = coverPic;
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

// POST /api/experiments/:id/upload-zip   (admin, nodal_centre, teacher)
const uploadZip = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { id } = req.params;

    // Fetch experiment along with lab and subject to construct slug folders
    const exp = await prisma.experiment.findUnique({
      where: { id },
      include: {
        lab: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!exp) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    const getSlug = (str) => {
      return str.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    const subjectSlug = getSlug(exp.lab.subject.title);
    const labSlug     = getSlug(exp.lab.title);
    const expSlug     = getSlug(exp.title);

    // Target sub-directories (relative to uploads/)
    const relativeContentSubDir = `${subjectSlug}/${labSlug}/${expSlug}/content`;

    // Absolute directory paths
    const absoluteContentDir = uploadsPath(subjectSlug, labSlug, expSlug, 'content');

    // Create a temporary path for zip extraction
    const tempExtractDir = path.join(__dirname, '../../tmp', `extracted-${id}`);

    // Clean temp extraction dir if it exists
    if (fs.existsSync(tempExtractDir)) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempExtractDir, { recursive: true });

    // Extract the main uploaded zip to the temp directory
    const AdmZip = require('adm-zip');
    const mainZip = new AdmZip(req.file.path);
    mainZip.extractAllTo(tempExtractDir, true);

    // Remove the uploaded temp zip file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.warn('Warning: Failed to delete temp uploaded zip file', e.message);
    }

    // ── Documentation files ────────────────────────────────────────────────────
    // Copy doc files (*.md, *.json, images/) to content directory.
    // Exclude non-doc directories like simulation/, template/, etc.
    const DOC_FILES = new Set(['aim.md', 'theory.md', 'procedure.md', 'references.md', 'contributors.md', 'pretest.json', 'posttest.json', 'README.md', 'assignment.md', 'experiment-name.md']);
    const DOC_DIRS  = new Set(['images']);
    const SIM_DIRS  = new Set(['simulation', 'template']); // folders to skip in content

    if (fs.existsSync(absoluteContentDir)) {
      fs.rmSync(absoluteContentDir, { recursive: true, force: true });
    }
    fs.mkdirSync(absoluteContentDir, { recursive: true });

    for (const entry of fs.readdirSync(tempExtractDir)) {
      const src = path.join(tempExtractDir, entry);
      const dst = path.join(absoluteContentDir, entry);
      const stat = fs.statSync(src);

      if (stat.isDirectory()) {
        if (DOC_DIRS.has(entry.toLowerCase())) {
          fs.cpSync(src, dst, { recursive: true });
        }
        // Skip simulation/, template/, and other non-doc dirs
      } else {
        // Copy all root-level files (md, json, etc.)
        fs.copyFileSync(src, dst);
      }
    }

    // ── Simulation ─────────────────────────────────────────────────────────────
    const tempSimPath = path.join(tempExtractDir, 'simulation');
    let finalSimPath = null;

    if (fs.existsSync(tempSimPath)) {
      // Detect whether the simulation/ folder has sibling dependency folders
      // (e.g. template/ for Angular-based experiments that use ../template/... paths).
      // These must be co-located alongside simulation/ so relative paths resolve.
      const siblingDirs = fs.readdirSync(tempExtractDir).filter((entry) => {
        const p = path.join(tempExtractDir, entry);
        return fs.statSync(p).isDirectory() && entry !== 'simulation' && !DOC_DIRS.has(entry.toLowerCase());
      });

      const hasSiblingDeps = siblingDirs.length > 0;

      if (hasSiblingDeps) {
        // Format 2 (Angular/template-based): copy simulation/ AND all sibling dirs
        // into a sim-root/ folder so ../template/ relative paths resolve correctly.
        const relativeSimRoot    = `${subjectSlug}/${labSlug}/${expSlug}/sim-root`;
        const absoluteSimRootDir = uploadsPath(subjectSlug, labSlug, expSlug, 'sim-root');

        if (fs.existsSync(absoluteSimRootDir)) {
          fs.rmSync(absoluteSimRootDir, { recursive: true, force: true });
        }
        fs.mkdirSync(absoluteSimRootDir, { recursive: true });

        // Copy simulation/ into sim-root/simulation/
        fs.cpSync(tempSimPath, path.join(absoluteSimRootDir, 'simulation'), { recursive: true });

        // Copy each sibling dependency dir (template/ etc.) into sim-root/
        for (const dir of siblingDirs) {
          const src = path.join(tempExtractDir, dir);
          const dst = path.join(absoluteSimRootDir, dir);
          fs.cpSync(src, dst, { recursive: true });
        }

        // simulationPath points to the simulation subfolder inside sim-root
        finalSimPath = `${relativeSimRoot}/simulation`;
        console.log(`✅ UploadZip: Angular/template simulation deployed to: ${absoluteSimRootDir}`);

      } else {
        // Format 1 (React/pre-compiled static): just use compileSimulation as before
        const relativeSimSubDir = `${subjectSlug}/${labSlug}/${expSlug}/simulation`;
        const tempSimZipPath = path.join(__dirname, '../../tmp', `temp-sim-${id}.zip`);
        const simZip = new AdmZip();
        simZip.addLocalFolder(tempSimPath);
        simZip.writeZip(tempSimZipPath);

        finalSimPath = await compileSimulation(tempSimZipPath, relativeSimSubDir);

        try {
          fs.unlinkSync(tempSimZipPath);
        } catch (e) {
          console.warn('Warning: Failed to delete temp simulation zip', e.message);
        }
        console.log(`✅ UploadZip: React/static simulation deployed to: ${relativeSimSubDir}`);
      }
    }

    // Cleanup temp extraction directory
    try {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    } catch (e) {
      console.warn('Warning: Failed to delete temp extraction dir', e.message);
    }

    // Update experiment model
    await prisma.experiment.update({
      where: { id },
      data: {
        contentPath: relativeContentSubDir,
        simulationPath: finalSimPath
      }
    });

    res.json({
      message: 'Experiment ZIP uploaded and assets extracted successfully',
      contentPath: relativeContentSubDir,
      simulationPath: finalSimPath
    });
  } catch (err) {
    console.error('Upload Experiment ZIP error:', err);
    res.status(500).json({ message: err.message || 'Experiment ZIP upload failed' });
  }
};

// GET /api/experiments/:id/docs   (public / student)
const getExperimentDocs = async (req, res) => {
  try {
    const { id } = req.params;
    const experiment = await prisma.experiment.findUnique({
      where: { id }
    });

    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    if (!experiment.contentPath) {
      return res.status(404).json({ message: 'No content uploaded for this experiment yet.' });
    }

    const absoluteDir = uploadsPath(experiment.contentPath);
    
    // Read markdown files
    const docs = {};
    const textFiles = {
      aim: 'aim.md',
      theory: 'theory.md',
      procedure: 'procedure.md',
      references: 'references.md',
      contributors: 'contributors.md'
    };

    const hostPrefix = `${req.protocol}://${req.get('host')}/files/${experiment.contentPath}/`;

    for (const [key, filename] of Object.entries(textFiles)) {
      const filePath = path.join(absoluteDir, filename);
      if (fs.existsSync(filePath)) {
        const rawMarkdown = fs.readFileSync(filePath, 'utf8');
        let html = marked.parse(rawMarkdown);
        // Rewrite relative image references inside HTML to absolute hosting paths
        html = html.replace(/src=["'](\.\/)?images\//g, `src="${hostPrefix}images/`);
        docs[key] = html;
      } else {
        docs[key] = '';
      }
    }

    // Read JSON quizzes
    const quizFiles = {
      pretest: 'pretest.json',
      posttest: 'posttest.json'
    };

    for (const [key, filename] of Object.entries(quizFiles)) {
      const filePath = path.join(absoluteDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          docs[key] = JSON.parse(raw);
        } catch (e) {
          console.warn(`Warning: Failed to parse quiz file ${filename} for experiment ${id}:`, e.message);
          docs[key] = { questions: [] };
        }
      } else {
        docs[key] = { questions: [] };
      }
    }

    res.json(docs);
  } catch (err) {
    console.error('Error fetching experiment docs:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getExperiments, getAllExperiments, getExperiment, getExperimentSection,
  createExperiment, updateExperiment, deleteExperiment,
  uploadZip, getExperimentDocs,
};
