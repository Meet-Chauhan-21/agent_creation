const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  duplicateProject,
  deleteProject,
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { projectValidation } = require('../middleware/validator');

router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProject);
router.post('/', authenticate, projectValidation, createProject);
router.put('/:id', authenticate, updateProject);
router.post('/:id/duplicate', authenticate, duplicateProject);
router.delete('/:id', authenticate, deleteProject);

module.exports = router;
