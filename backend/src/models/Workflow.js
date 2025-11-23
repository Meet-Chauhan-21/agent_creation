const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    nodes: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
    edges: [
      {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        sourceHandle: String,
        targetHandle: String,
        label: String,
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
    settings: {
      concurrency: { type: Number, default: 1 },
      retryPolicy: {
        enabled: { type: Boolean, default: false },
        maxRetries: { type: Number, default: 3 },
        retryDelay: { type: Number, default: 1000 },
      },
      schedule: {
        enabled: { type: Boolean, default: false },
        cron: String,
      },
      timeout: { type: Number, default: 300000 }, // 5 minutes
    },
    version: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
workflowSchema.index({ projectId: 1, createdAt: -1 });
workflowSchema.index({ createdBy: 1 });

// Increment version on update
workflowSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified()) {
    this.version += 1;
  }
  next();
});

module.exports = mongoose.model('Workflow', workflowSchema);
