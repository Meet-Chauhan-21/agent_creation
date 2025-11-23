const mongoose = require('mongoose');

const runSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
    duration: {
      type: Number, // in milliseconds
    },
    logs: [
      {
        level: {
          type: String,
          enum: ['info', 'warn', 'error', 'debug'],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        nodeId: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        data: mongoose.Schema.Types.Mixed,
      },
    ],
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    error: {
      message: String,
      stack: String,
      nodeId: String,
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    nodeExecutions: [
      {
        nodeId: String,
        status: String,
        startedAt: Date,
        finishedAt: Date,
        input: mongoose.Schema.Types.Mixed,
        output: mongoose.Schema.Types.Mixed,
        error: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
runSchema.index({ workflowId: 1, createdAt: -1 });
runSchema.index({ status: 1 });

module.exports = mongoose.model('Run', runSchema);
