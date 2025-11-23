const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Built-in node types
const nodeTypes = [
  {
    id: 'http-request',
    name: 'HTTP Request',
    category: 'Network',
    description: 'Make HTTP/HTTPS requests',
    icon: '🌐',
    inputs: ['trigger'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET' },
      { name: 'url', type: 'string', required: true },
      { name: 'headers', type: 'json', default: {} },
      { name: 'body', type: 'json', default: {} },
      { name: 'timeout', type: 'number', default: 30000 },
    ],
  },
  {
    id: 'json-parse',
    name: 'JSON Parse',
    category: 'Data',
    description: 'Parse JSON string',
    icon: '📋',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'jsonString', type: 'string', required: true },
    ],
  },
  {
    id: 'log',
    name: 'Log',
    category: 'Utilities',
    description: 'Log data to console',
    icon: '📝',
    inputs: ['data'],
    outputs: ['success'],
    parameters: [
      { name: 'message', type: 'string', required: true },
      { name: 'level', type: 'select', options: ['info', 'warn', 'error', 'debug'], default: 'info' },
    ],
  },
  {
    id: 'delay',
    name: 'Delay',
    category: 'Utilities',
    description: 'Wait for specified duration',
    icon: '⏱️',
    inputs: ['trigger'],
    outputs: ['success'],
    parameters: [
      { name: 'duration', type: 'number', required: true, default: 1000 },
    ],
  },
  {
    id: 'condition',
    name: 'Condition',
    category: 'Logic',
    description: 'Branch based on condition',
    icon: '🔀',
    inputs: ['data'],
    outputs: ['true', 'false'],
    parameters: [
      { name: 'condition', type: 'string', required: true },
      { name: 'value1', type: 'string' },
      { name: 'operator', type: 'select', options: ['==', '!=', '>', '<', '>=', '<='], default: '==' },
      { name: 'value2', type: 'string' },
    ],
  },
  {
    id: 'transform',
    name: 'Transform',
    category: 'Data',
    description: 'Transform data using JavaScript',
    icon: '🔄',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'code', type: 'code', required: true, default: 'return data;' },
    ],
  },
  {
    id: 'webhook',
    name: 'Webhook',
    category: 'Triggers',
    description: 'Trigger workflow via webhook',
    icon: '🪝',
    inputs: [],
    outputs: ['trigger'],
    parameters: [
      { name: 'path', type: 'string', required: true },
      { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
    ],
  },
  {
    id: 'schedule',
    name: 'Schedule',
    category: 'Triggers',
    description: 'Trigger workflow on schedule',
    icon: '📅',
    inputs: [],
    outputs: ['trigger'],
    parameters: [
      { name: 'cron', type: 'string', required: true, default: '0 0 * * *' },
    ],
  },
  {
    id: 'email',
    name: 'Send Email',
    category: 'Communication',
    description: 'Send email',
    icon: '📧',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'to', type: 'string', required: true },
      { name: 'subject', type: 'string', required: true },
      { name: 'body', type: 'text', required: true },
      { name: 'secretId', type: 'secret' },
    ],
  },
  {
    id: 'database-query',
    name: 'Database Query',
    category: 'Database',
    description: 'Execute database query',
    icon: '🗄️',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'query', type: 'text', required: true },
      { name: 'secretId', type: 'secret', required: true },
    ],
  },
];

// @desc    Get all available node types
// @route   GET /api/nodes
// @access  Private
router.get('/', authenticate, (req, res) => {
  res.json({
    success: true,
    count: nodeTypes.length,
    data: {
      nodes: nodeTypes,
    },
  });
});

// @desc    Get single node type
// @route   GET /api/nodes/:id
// @access  Private
router.get('/:id', authenticate, (req, res) => {
  const node = nodeTypes.find(n => n.id === req.params.id);
  
  if (!node) {
    return res.status(404).json({
      success: false,
      message: 'Node type not found',
    });
  }

  res.json({
    success: true,
    data: {
      node,
    },
  });
});

module.exports = router;
