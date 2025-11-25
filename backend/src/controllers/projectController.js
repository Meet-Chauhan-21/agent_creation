const Project = require('../models/Project');
const Workflow = require('../models/Workflow');

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');

    res.json({
      success: true,
      count: projects.length,
      data: {
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check ownership
    if (project.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project',
      });
    }

    res.json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, coverImage, settings, tags } = req.body;

    const project = await Project.create({
      owner: req.user._id,
      name,
      description,
      coverImage,
      settings,
      tags,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check ownership
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    const { name, description, coverImage, settings, tags } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (coverImage !== undefined) project.coverImage = coverImage;
    if (settings) project.settings = settings;
    if (tags !== undefined) project.tags = tags;

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate project
// @route   POST /api/projects/:id/duplicate
// @access  Private
const duplicateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check ownership
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to duplicate this project',
      });
    }

    // Create duplicate project
    const duplicatedProject = await Project.create({
      owner: req.user._id,
      name: `${project.name} (Copy)`,
      description: project.description,
      coverImage: project.coverImage,
      tags: project.tags,
      settings: project.settings,
    });

    // Duplicate all workflows in project
    const workflows = await Workflow.find({ projectId: project._id });
    const duplicatedWorkflows = await Promise.all(
      workflows.map(async (workflow) => {
        return await Workflow.create({
          projectId: duplicatedProject._id,
          name: workflow.name,
          description: workflow.description,
          tags: workflow.tags,
          nodes: workflow.nodes,
          edges: workflow.edges,
          version: 1,
        });
      })
    );

    res.status(201).json({
      success: true,
      message: 'Project duplicated successfully',
      data: {
        project: duplicatedProject,
        workflowCount: duplicatedWorkflows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check ownership
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    // Delete all workflows in project
    await Workflow.deleteMany({ projectId: project._id });

    // Delete project
    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project and associated workflows deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  duplicateProject,
  deleteProject,
};
