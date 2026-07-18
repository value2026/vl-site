const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getExperiments, getAllExperiments, getExperiment, getExperimentSection,
  createExperiment, updateExperiment, deleteExperiment,
  uploadContent, uploadSimulation, getExperimentDocs,
} = require('../controllers/experimentsController');

// Public
router.get('/',                getExperiments);
router.get('/:id',             getExperiment);
router.get('/:id/docs',        getExperimentDocs);
router.get('/:id/content/:section', getExperimentSection);

// Staff
router.get('/all/list', verifyToken, requireRole('admin', 'content_admin'), getAllExperiments);
router.post('/',        verifyToken, requireRole('admin', 'content_admin'), createExperiment);
router.put('/:id',      verifyToken, requireRole('admin', 'content_admin'), updateExperiment);
router.delete('/:id',   verifyToken, requireRole('admin', 'content_admin'), deleteExperiment);

// File uploads
router.post(
  '/:id/upload-content',
  verifyToken,
  requireRole('admin', 'content_admin'),
  upload.single('file'),
  uploadContent,
);
router.post(
  '/:id/upload-simulation',
  verifyToken,
  requireRole('admin', 'content_admin'),
  upload.single('file'),
  uploadSimulation,
);

module.exports = router;
