const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
} = require('../middleware/validator');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

module.exports = router;
