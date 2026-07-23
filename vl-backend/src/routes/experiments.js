const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getExperiments, getAllExperiments, getExperiment, getExperimentSection,
  createExperiment, updateExperiment, deleteExperiment,
  uploadZip, getExperimentDocs,
} = require('../controllers/experimentsController');

// Public
router.get('/',                getExperiments);
router.get('/:id',             getExperiment);
router.get('/:id/docs',        getExperimentDocs);
router.get('/:id/content/:section', getExperimentSection);

// Staff
router.get('/all/list', verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), getAllExperiments);
router.post('/',        verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), createExperiment);
router.put('/:id',      verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), updateExperiment);
router.delete('/:id',   verifyToken, requireRole('admin', 'nodal_centre', 'teacher'), deleteExperiment);

// File uploads
router.post(
  '/:id/upload-zip',
  verifyToken,
  requireRole('admin', 'nodal_centre', 'teacher'),
  upload.single('file'),
  uploadZip,
);

module.exports = router;
