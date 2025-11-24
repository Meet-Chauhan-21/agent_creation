const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updatePassword, getUserProjects, getUserWorkflows } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.put('/me/password', authenticate, updatePassword);
router.get('/me/projects', authenticate, getUserProjects);
router.get('/me/workflows', authenticate, getUserWorkflows);

module.exports = router;
