const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/me/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's projects with stats
// @route   GET /api/users/me/projects
// @access  Private
const getUserProjects = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const Workflow = require('../models/Workflow');

    const projects = await Project.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(10);

    // Get workflow count for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const workflowCount = await Workflow.countDocuments({ projectId: project._id });
        return {
          ...project.toJSON(),
          workflowCount,
        };
      })
    );

    res.json({
      success: true,
      count: projectsWithStats.length,
      data: {
        projects: projectsWithStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's recent workflows
// @route   GET /api/users/me/workflows
// @access  Private
const getUserWorkflows = async (req, res, next) => {
  try {
    const Workflow = require('../models/Workflow');
    const Project = require('../models/Project');

    // Get all user's projects first
    const userProjects = await Project.find({ owner: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    // Get workflows from user's projects
    const workflows = await Workflow.find({ projectId: { $in: projectIds } })
      .populate('projectId', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: workflows.length,
      data: {
        workflows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  getUserProjects,
  getUserWorkflows,
};
