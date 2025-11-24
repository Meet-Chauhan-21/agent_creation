import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Globe, Code, Database, Clock, GitBranch, 
  Mail, Webhook, Calendar, Play, Zap,
  Brain, Bot, MessageSquare, FileJson, 
  Terminal, Server, Cloud, Lock
} from 'lucide-react';

const iconMap = {
  '🌐': Globe,
  '📋': FileJson,
  '📝': Terminal,
  '⏱️': Clock,
  '🔀': GitBranch,
  '🔄': Code,
  '🪝': Webhook,
  '📅': Calendar,
  '📧': Mail,
  '🗄️': Database,
  '🤖': Bot,
  '🧠': Brain,
  '💬': MessageSquare,
  '⚡': Zap,
  '🔒': Lock,
  '☁️': Cloud,
  '🖥️': Server,
};

const CustomNode = ({ data, selected }) => {
  const IconComponent = iconMap[data.icon] || Code;
  
  const getCategoryColor = (category) => {
    const colors = {
      'Triggers': 'from-orange-500 to-red-500',
      'AI': 'from-purple-500 to-pink-500',
      'Data': 'from-blue-500 to-cyan-500',
      'Logic': 'from-green-500 to-emerald-500',
      'Network': 'from-indigo-500 to-blue-500',
      'Communication': 'from-pink-500 to-rose-500',
      'Database': 'from-cyan-500 to-teal-500',
      'Utilities': 'from-gray-500 to-slate-500',
    };
    return colors[data.category] || 'from-primary-500 to-primary-600';
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-xl border-2 bg-white dark:bg-[#1a1a1a] min-w-[180px] transition-all duration-200 ${
        selected
          ? 'border-primary-500 dark:border-primary-400 shadow-primary-500/50 scale-105'
          : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gradient-to-r from-primary-500 to-primary-600 border-2 border-white dark:border-gray-800"
      />

      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryColor(data.category)} flex items-center justify-center shadow-md`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900 dark:text-white">
            {data.label}
          </div>
          {data.category && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {data.category}
            </div>
          )}
        </div>
      </div>

      {data.parameters && Object.keys(data.parameters).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Object.keys(data.parameters).length} parameter(s)
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gradient-to-r from-primary-500 to-primary-600 border-2 border-white dark:border-gray-800"
      />
    </div>
  );
};

export default memo(CustomNode);
