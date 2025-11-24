const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Built-in node types
const nodeTypes = [
  // Triggers
  {
    id: 'schedule',
    name: 'Schedule',
    category: 'Triggers',
    description: 'Trigger workflow on schedule (cron)',
    icon: '📅',
    inputs: [],
    outputs: ['trigger'],
    parameters: [
      { name: 'cron', type: 'string', required: true, default: '0 0 * * *', placeholder: '0 0 * * *' },
      { name: 'timezone', type: 'string', default: 'UTC' },
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
      { name: 'path', type: 'string', required: true, placeholder: '/webhook/my-endpoint' },
      { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
      { name: 'authentication', type: 'select', options: ['none', 'basic', 'bearer'], default: 'none' },
    ],
  },
  {
    id: 'manual-trigger',
    name: 'Manual Trigger',
    category: 'Triggers',
    description: 'Start workflow manually',
    icon: '▶️',
    inputs: [],
    outputs: ['trigger'],
    parameters: [],
  },
  // AI & LLMs
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'AI',
    description: 'Use OpenAI GPT models',
    icon: '🤖',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'], default: 'gpt-3.5-turbo' },
      { name: 'prompt', type: 'text', required: true, placeholder: 'Enter your prompt here' },
      { name: 'temperature', type: 'number', default: 0.7, min: 0, max: 2 },
      { name: 'maxTokens', type: 'number', default: 1000 },
      { name: 'secretId', type: 'secret', required: true },
    ],
  },
  {
    id: 'ai-agent',
    name: 'AI Agent',
    category: 'AI',
    description: 'Create an AI agent with tools',
    icon: '🧠',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'agentType', type: 'select', options: ['conversational', 'task', 'research'], default: 'task' },
      { name: 'instructions', type: 'text', required: true, placeholder: 'Agent instructions' },
      { name: 'tools', type: 'json', default: [] },
      { name: 'secretId', type: 'secret', required: true },
    ],
  },
  {
    id: 'llm-chain',
    name: 'LLM Chain',
    category: 'AI',
    description: 'Chain multiple LLM calls',
    icon: '🔗',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'model', type: 'string', required: true, default: 'gpt-3.5-turbo' },
      { name: 'prompts', type: 'json', required: true, default: [] },
      { name: 'secretId', type: 'secret', required: true },
    ],
  },
  // Code & Transform
  {
    id: 'code',
    name: 'Code',
    category: 'Data',
    description: 'Execute custom JavaScript code',
    icon: '🔄',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'code', type: 'code', required: true, default: 'return data;', placeholder: 'return data;' },
    ],
  },
  {
    id: 'function',
    name: 'Function',
    category: 'Data',
    description: 'Define reusable function',
    icon: '⚙️',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'functionName', type: 'string', required: true },
      { name: 'code', type: 'code', required: true, default: 'function process(data) {\n  return data;\n}' },
    ],
  },
  // HTTP & Network
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
      { name: 'url', type: 'string', required: true, placeholder: 'https://api.example.com' },
      { name: 'headers', type: 'json', default: {} },
      { name: 'body', type: 'json', default: {} },
      { name: 'timeout', type: 'number', default: 30000 },
      { name: 'authentication', type: 'select', options: ['none', 'basic', 'bearer', 'oauth2'], default: 'none' },
    ],
  },
  // Data Processing
  {
    id: 'json-parse',
    name: 'JSON Parse',
    category: 'Data',
    description: 'Parse JSON string to object',
    icon: '📋',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'jsonString', type: 'string', required: true, placeholder: '{"key": "value"}' },
    ],
  },
  {
    id: 'json-stringify',
    name: 'JSON Stringify',
    category: 'Data',
    description: 'Convert object to JSON string',
    icon: '📄',
    inputs: ['data'],
    outputs: ['success'],
    parameters: [
      { name: 'data', type: 'json', required: true },
      { name: 'pretty', type: 'boolean', default: false },
    ],
  },
  {
    id: 'filter',
    name: 'Filter',
    category: 'Data',
    description: 'Filter array items',
    icon: '🔍',
    inputs: ['data'],
    outputs: ['success'],
    parameters: [
      { name: 'condition', type: 'code', required: true, default: 'return item.value > 0;' },
    ],
  },
  {
    id: 'map',
    name: 'Map',
    category: 'Data',
    description: 'Transform array items',
    icon: '🗺️',
    inputs: ['data'],
    outputs: ['success'],
    parameters: [
      { name: 'transform', type: 'code', required: true, default: 'return item;' },
    ],
  },
  // Logic & Control
  {
    id: 'condition',
    name: 'IF Condition',
    category: 'Logic',
    description: 'Branch based on condition',
    icon: '🔀',
    inputs: ['data'],
    outputs: ['true', 'false'],
    parameters: [
      { name: 'condition', type: 'code', required: true, default: 'return data.value > 0;' },
    ],
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Logic',
    description: 'Route based on value',
    icon: '🔀',
    inputs: ['data'],
    outputs: ['case1', 'case2', 'case3', 'default'],
    parameters: [
      { name: 'value', type: 'string', required: true },
      { name: 'cases', type: 'json', required: true, default: {} },
    ],
  },
  {
    id: 'loop',
    name: 'Loop',
    category: 'Logic',
    description: 'Iterate over items',
    icon: '🔁',
    inputs: ['data'],
    outputs: ['item', 'done'],
    parameters: [
      { name: 'items', type: 'json', required: true },
    ],
  },
  {
    id: 'merge',
    name: 'Merge',
    category: 'Logic',
    description: 'Merge multiple inputs',
    icon: '🔗',
    inputs: ['input1', 'input2', 'input3'],
    outputs: ['success'],
    parameters: [
      { name: 'mode', type: 'select', options: ['combine', 'wait'], default: 'combine' },
    ],
  },
  // Database
  {
    id: 'database-query',
    name: 'Database Query',
    category: 'Database',
    description: 'Execute database query',
    icon: '🗄️',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'operation', type: 'select', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], default: 'SELECT' },
      { name: 'query', type: 'text', required: true, placeholder: 'SELECT * FROM users' },
      { name: 'secretId', type: 'secret', required: true },
    ],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    description: 'MongoDB operations',
    icon: '🍃',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'operation', type: 'select', options: ['find', 'insertOne', 'updateOne', 'deleteOne'], default: 'find' },
      { name: 'collection', type: 'string', required: true },
      { name: 'query', type: 'json', default: {} },
      { name: 'secretId', type: 'secret', required: true },
    ],
  },
  // Communication
  {
    id: 'email',
    name: 'Send Email',
    category: 'Communication',
    description: 'Send email via SMTP',
    icon: '📧',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'to', type: 'string', required: true, placeholder: 'user@example.com' },
      { name: 'subject', type: 'string', required: true, placeholder: 'Email subject' },
      { name: 'body', type: 'text', required: true, placeholder: 'Email body' },
      { name: 'from', type: 'string', required: true },
      { name: 'secretId', type: 'secret' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Send Slack messages',
    icon: '💬',
    inputs: ['data'],
    outputs: ['success', 'error'],
    parameters: [
      { name: 'channel', type: 'string', required: true, placeholder: '#general' },
      { name: 'message', type: 'text', required: true, placeholder: 'Your message' },
      { name: 'secretId', type: 'secret', required: true },
    ],
  },
  // Utilities
  {
    id: 'delay',
    name: 'Wait',
    category: 'Utilities',
    description: 'Wait for specified duration',
    icon: '⏱️',
    inputs: ['trigger'],
    outputs: ['success'],
    parameters: [
      { name: 'duration', type: 'number', required: true, default: 1000, placeholder: '1000 (milliseconds)' },
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
      { name: 'message', type: 'string', required: true, placeholder: 'Log message' },
      { name: 'level', type: 'select', options: ['info', 'warn', 'error', 'debug'], default: 'info' },
    ],
  },
  {
    id: 'error-handler',
    name: 'Error Handler',
    category: 'Utilities',
    description: 'Handle errors gracefully',
    icon: '⚠️',
    inputs: ['error'],
    outputs: ['handled'],
    parameters: [
      { name: 'action', type: 'select', options: ['continue', 'retry', 'stop'], default: 'continue' },
      { name: 'retries', type: 'number', default: 3 },
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
