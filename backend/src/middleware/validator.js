const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
  body('coverImage').optional().trim(),
  validate,
];

const workflowValidation = [
  body('name').trim().notEmpty().withMessage('Workflow name is required'),
  body('description').optional().trim(),
  body('nodes').optional().isArray().withMessage('Nodes must be an array'),
  body('edges').optional().isArray().withMessage('Edges must be an array'),
  validate,
];

const secretValidation = [
  body('name').trim().notEmpty().withMessage('Secret name is required'),
  body('type')
    .isIn(['api_key', 'oauth2', 'basic_auth', 'custom'])
    .withMessage('Invalid secret type'),
  body('payload').notEmpty().withMessage('Payload is required'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  projectValidation,
  workflowValidation,
  secretValidation,
};
