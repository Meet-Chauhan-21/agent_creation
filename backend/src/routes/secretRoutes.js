const express = require('express');
const router = express.Router();
const {
  getSecrets,
  getSecret,
  createSecret,
  updateSecret,
  deleteSecret,
} = require('../controllers/secretController');
const { authenticate } = require('../middleware/auth');
const { secretValidation } = require('../middleware/validator');

router.get('/', authenticate, getSecrets);
router.get('/:id', authenticate, getSecret);
router.post('/', authenticate, secretValidation, createSecret);
router.put('/:id', authenticate, updateSecret);
router.delete('/:id', authenticate, deleteSecret);

module.exports = router;
