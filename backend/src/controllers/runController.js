const Run = require('../models/Run');
const Workflow = require('../models/Workflow');
const Project = require('../models/Project');
const { executeWorkflow } = require('../services/executionEngine');

// @desc    Get all runs for a workflow
// @route   GET /api/workflows/:workflowId/runs
// @access  Private
const getRuns = async (req, res, next) => {
  try {
    const { workflowId } = req.params;

    // Verify workflow access
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }

    const project = await Project.findById(workflow.projectId);
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these runs',
      });
    }

    const runs = await Run.find({ workflowId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('executedBy', 'name email');

    res.json({
      success: true,
      count: runs.length,
      data: {
        runs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single run
// @route   GET /api/runs/:runId
// @access  Private
const getRun = async (req, res, next) => {
  try {
    const run = await Run.findById(req.params.runId)
      .populate('workflowId')
      .populate('executedBy', 'name email');

    if (!run) {
      return res.status(404).json({
        success: false,
        message: 'Run not found',
      });
    }

    // Verify access via workflow project
    const workflow = await Workflow.findById(run.workflowId);
    const project = await Project.findById(workflow.projectId);
    
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this run',
      });
    }

    res.json({
      success: true,
      data: {
        run,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start workflow execution
// @route   POST /api/workflows/:workflowId/run
// @access  Private
const startRun = async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const { input } = req.body;

    // Verify workflow access
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }

    const project = await Project.findById(workflow.projectId);
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to run this workflow',
      });
    }

    // Create run record
    const run = await Run.create({
      workflowId: workflow._id,
      status: 'pending',
      input: input || {},
      executedBy: req.user._id,
    });

    // Execute workflow asynchronously
    executeWorkflow(workflow, run, req.io);

    res.status(201).json({
      success: true,
      message: 'Workflow execution started',
      data: {
        run,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRuns,
  getRun,
  startRun,
};
