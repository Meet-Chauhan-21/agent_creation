const express = require('express');
const router = express.Router();
const { getRuns, getRun, startRun } = require('../controllers/runController');
const { authenticate } = require('../middleware/auth');

router.get('/workflows/:workflowId/runs', authenticate, getRuns);
router.post('/workflows/:workflowId/run', authenticate, startRun);
router.get('/runs/:runId', authenticate, getRun);

module.exports = router;
