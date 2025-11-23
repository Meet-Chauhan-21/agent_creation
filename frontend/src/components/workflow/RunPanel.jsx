import React, { useEffect, useState } from 'react';
import { X, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function RunPanel({ workflowId, socket, onClose }) {
  const { runs, fetchRuns } = useWorkflowStore();
  const [selectedRun, setSelectedRun] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchRuns(workflowId);
  }, [workflowId]);

  useEffect(() => {
    if (selectedRun && socket) {
      // Subscribe to run updates
      socket.emit('subscribe:run', selectedRun._id);

      socket.on(`run:${selectedRun._id}`, (data) => {
        console.log('Run update:', data);
        fetchRuns(workflowId);
      });

      socket.on(`run:${selectedRun._id}:log`, (log) => {
        setLogs((prev) => [...prev, log]);
      });

      return () => {
        socket.emit('unsubscribe:run', selectedRun._id);
        socket.off(`run:${selectedRun._id}`);
        socket.off(`run:${selectedRun._id}:log`);
      };
    }
  }, [selectedRun, socket]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-800 shadow-lg flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Run History</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {runs.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No runs yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Click "Run" to execute this workflow
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {runs.map((run) => (
              <div
                key={run._id}
                onClick={() => {
                  setSelectedRun(run);
                  setLogs(run.logs || []);
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedRun?._id === run._id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(run.status)}
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(run.status)}`}>
                      {run.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(run.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {run.duration && (
                  <p className="text-xs text-gray-600">
                    Duration: {(run.duration / 1000).toFixed(2)}s
                  </p>
                )}

                {run.error && (
                  <p className="text-xs text-red-600 mt-1 truncate">
                    Error: {run.error.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRun && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Logs</h3>
          </div>
          <div className="h-64 overflow-y-auto p-3 font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.level === 'error'
                      ? 'text-red-600'
                      : log.level === 'warn'
                      ? 'text-yellow-600'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-gray-400">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>{' '}
                  <span className="font-semibold">[{log.level.toUpperCase()}]</span>{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
