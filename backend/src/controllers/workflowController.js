const Workflow = require('../models/Workflow');
const Project = require('../models/Project');
const Run = require('../models/Run');

// @desc    Get all workflows for a project
// @route   GET /api/projects/:projectId/workflows
// @access  Private
const getWorkflows = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify project ownership
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project',
      });
    }

    const workflows = await Workflow.find({ projectId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

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

// @desc    Get single workflow
// @route   GET /api/workflows/:id
// @access  Private
const getWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('projectId')
      .populate('createdBy', 'name email');

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }

    // Check ownership via project
    const project = await Project.findById(workflow.projectId);
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workflow',
      });
    }

    res.json({
      success: true,
      data: {
        workflow,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new workflow
// @route   POST /api/projects/:projectId/workflows
// @access  Private
const createWorkflow = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, nodes, edges, settings, tags } = req.body;

    // Verify project ownership
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create workflow in this project',
      });
    }

    const workflow = await Workflow.create({
      projectId,
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      settings: settings || {},
      tags: tags || [],
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: {
        workflow,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workflow
// @route   PUT /api/workflows/:id
// @access  Private
const updateWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }

    // Check ownership via project
    const project = await Project.findById(workflow.projectId);
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this workflow',
      });
    }

    // Check version for optimistic locking
    const { version, name, description, nodes, edges, settings, isActive, tags } = req.body;
    
    if (version !== undefined && version !== workflow.version) {
      return res.status(409).json({
        success: false,
        message: 'Workflow has been modified by another user. Please refresh and try again.',
        currentVersion: workflow.version,
      });
    }

    if (name) workflow.name = name;
    if (description !== undefined) workflow.description = description;
    if (nodes) workflow.nodes = nodes;
    if (edges) workflow.edges = edges;
    if (settings) workflow.settings = { ...workflow.settings, ...settings };
    if (isActive !== undefined) workflow.isActive = isActive;
    if (tags !== undefined) workflow.tags = tags;

    await workflow.save();

    res.json({
      success: true,
      message: 'Workflow updated successfully',
      data: {
        workflow,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate workflow
// @route   POST /api/workflows/:id/duplicate
// @access  Private
const duplicateWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }

    // Check ownership via project
    const project = await Project.findById(workflow.projectId);
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to duplicate this workflow',
      });
    }

    const duplicatedWorkflow = await Workflow.create({
      projectId: workflow.projectId,
      name: `${workflow.name} (Copy)`,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      settings: workflow.settings,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Workflow duplicated successfully',
      data: {
        workflow: duplicatedWorkflow,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workflow
// @route   DELETE /api/workflows/:id
// @access  Private
const deleteWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }

    // Check ownership via project
    const project = await Project.findById(workflow.projectId);
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this workflow',
      });
    }

    // Delete all runs for this workflow
    await Run.deleteMany({ workflowId: workflow._id });

    await workflow.deleteOne();

    res.json({
      success: true,
      message: 'Workflow and associated runs deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
};
