const Secret = require('../models/Secret');

// @desc    Get all secrets for user
// @route   GET /api/secrets
// @access  Private
const getSecrets = async (req, res, next) => {
  try {
    const secrets = await Secret.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select('-encryptedPayload'); // Don't send encrypted payload in list

    res.json({
      success: true,
      count: secrets.length,
      data: {
        secrets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single secret (without decrypted data)
// @route   GET /api/secrets/:id
// @access  Private
const getSecret = async (req, res, next) => {
  try {
    const secret = await Secret.findById(req.params.id).select('-encryptedPayload');

    if (!secret) {
      return res.status(404).json({
        success: false,
        message: 'Secret not found',
      });
    }

    // Check ownership
    if (secret.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this secret',
      });
    }

    res.json({
      success: true,
      data: {
        secret,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new secret
// @route   POST /api/secrets
// @access  Private
const createSecret = async (req, res, next) => {
  try {
    const { name, type, payload, description } = req.body;

    // Encrypt payload
    const encryptedPayload = Secret.encryptData(payload);

    const secret = await Secret.create({
      name,
      owner: req.user._id,
      type,
      encryptedPayload,
      description,
    });

    // Don't return encrypted payload
    const secretResponse = secret.toObject();
    delete secretResponse.encryptedPayload;

    res.status(201).json({
      success: true,
      message: 'Secret created successfully',
      data: {
        secret: secretResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update secret
// @route   PUT /api/secrets/:id
// @access  Private
const updateSecret = async (req, res, next) => {
  try {
    const secret = await Secret.findById(req.params.id);

    if (!secret) {
      return res.status(404).json({
        success: false,
        message: 'Secret not found',
      });
    }

    // Check ownership
    if (secret.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this secret',
      });
    }

    const { name, type, payload, description } = req.body;

    if (name) secret.name = name;
    if (type) secret.type = type;
    if (description !== undefined) secret.description = description;
    if (payload) {
      secret.encryptedPayload = Secret.encryptData(payload);
    }

    await secret.save();

    const secretResponse = secret.toObject();
    delete secretResponse.encryptedPayload;

    res.json({
      success: true,
      message: 'Secret updated successfully',
      data: {
        secret: secretResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete secret
// @route   DELETE /api/secrets/:id
// @access  Private
const deleteSecret = async (req, res, next) => {
  try {
    const secret = await Secret.findById(req.params.id);

    if (!secret) {
      return res.status(404).json({
        success: false,
        message: 'Secret not found',
      });
    }

    // Check ownership
    if (secret.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this secret',
      });
    }

    await secret.deleteOne();

    res.json({
      success: true,
      message: 'Secret deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSecrets,
  getSecret,
  createSecret,
  updateSecret,
  deleteSecret,
};
