const express = require('express');
const router = express.Router();
const {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
} = require('../controllers/workflowController');
const { authenticate } = require('../middleware/auth');
const { workflowValidation } = require('../middleware/validator');

// Workflow routes under projects
router.get('/projects/:projectId/workflows', authenticate, getWorkflows);
router.post(
  '/projects/:projectId/workflows',
  authenticate,
  workflowValidation,
  createWorkflow
);

// Individual workflow routes
router.get('/workflows/:id', authenticate, getWorkflow);
router.put('/workflows/:id', authenticate, updateWorkflow);
router.post('/workflows/:id/duplicate', authenticate, duplicateWorkflow);
router.delete('/workflows/:id', authenticate, deleteWorkflow);

module.exports = router;
