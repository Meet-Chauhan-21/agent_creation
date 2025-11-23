import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { secrets } from '../../lib/api';

export default function NodePropertiesPanel({ node, onUpdate, onClose }) {
  const [parameters, setParameters] = useState(node.data.parameters || {});
  const [availableSecrets, setAvailableSecrets] = useState([]);

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    try {
      const response = await secrets.getAll();
      setAvailableSecrets(response.data.data.secrets);
    } catch (error) {
      console.error('Failed to load secrets:', error);
    }
  };

  const handleParameterChange = (paramName, value) => {
    const updated = { ...parameters, [paramName]: value };
    setParameters(updated);
    onUpdate(node.id, { parameters: updated });
  };

  const handleLabelChange = (label) => {
    onUpdate(node.id, { label });
  };

  // Get node type information from backend
  const renderParameterInput = (param) => {
    const value = parameters[param.name] || param.default || '';

    switch (param.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="input text-sm"
          >
            {param.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            className="input text-sm"
          />
        );

      case 'text':
      case 'code':
        return (
          <textarea
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="input text-sm font-mono"
            rows={param.type === 'code' ? 6 : 3}
          />
        );

      case 'json':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleParameterChange(param.name, parsed);
              } catch {
                handleParameterChange(param.name, e.target.value);
              }
            }}
            className="input text-sm font-mono"
            rows={4}
          />
        );

      case 'secret':
        return (
          <select
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="input text-sm"
          >
            <option value="">Select a secret...</option>
            {availableSecrets.map((secret) => (
              <option key={secret._id} value={secret._id}>
                {secret.name} ({secret.type})
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="input text-sm"
          />
        );
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Node Properties</h2>
        <button
          onClick={onClose}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Node Icon and Type */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-gray-800">
          <span className="text-2xl">{node.data.icon}</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{node.data.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{node.data.nodeType}</p>
          </div>
        </div>

        {/* Node Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Label
          </label>
          <input
            type="text"
            value={node.data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="input text-sm"
          />
        </div>

        {/* Node ID (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Node ID
          </label>
          <input
            type="text"
            value={node.id}
            readOnly
            className="input text-sm bg-gray-50 dark:bg-[#0a0a0a] cursor-not-allowed opacity-60"
          />
        </div>

        {/* Parameters - This would be populated based on node type from backend */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Parameters</h3>
          
          {/* Example parameters - in real app, fetch from node type definition */}
          {node.data.nodeType === 'http-request' && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Method
                </label>
                {renderParameterInput({ name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' })}
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  value={parameters.url || ''}
                  onChange={(e) => handleParameterChange('url', e.target.value)}
                  className="input text-sm"
                  placeholder="https://api.example.com"
                />
              </div>
            </>
          )}

          {node.data.nodeType === 'log' && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={parameters.message || ''}
                  onChange={(e) => handleParameterChange('message', e.target.value)}
                  className="input text-sm"
                  rows={3}
                  placeholder="Log message..."
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Level
                </label>
                {renderParameterInput({ name: 'level', type: 'select', options: ['info', 'warn', 'error', 'debug'], default: 'info' })}
              </div>
            </>
          )}

          {/* Generic text input for other parameters */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom Data (JSON)
            </label>
            <textarea
              value={JSON.stringify(parameters, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setParameters(parsed);
                  onUpdate(node.id, { parameters: parsed });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              className="input text-sm font-mono"
              rows={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
