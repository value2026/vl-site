const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getExperiments, getAllExperiments, getExperiment, getExperimentSection,
  createExperiment, updateExperiment, deleteExperiment,
  uploadContent, uploadSimulation,
} = require('../controllers/experimentsController');

// Public
router.get('/',                getExperiments);
router.get('/:id',             getExperiment);
router.get('/:id/content/:section', getExperimentSection);

// Staff
router.get('/all/list', verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), getAllExperiments);
router.post('/',        verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), createExperiment);
router.put('/:id',      verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), updateExperiment);
router.delete('/:id',   verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), deleteExperiment);

// File uploads
router.post(
  '/:id/upload-content',
  verifyToken,
  requireRole('admin', 'nodal_centre'),
  upload.single('file'),
  uploadContent,
);
router.post(
  '/:id/upload-simulation',
  verifyToken,
  requireRole('admin', 'nodal_centre', 'teacher'),
  upload.single('file'),
  uploadSimulation,
);

module.exports = router;
