import React, { useEffect, useState } from 'react';
import { nodes } from '../../lib/api';
import { Search } from 'lucide-react';

export default function NodePalette({ onAddNode }) {
  const [nodeTypes, setNodeTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState({});

  useEffect(() => {
    loadNodeTypes();
  }, []);

  const loadNodeTypes = async () => {
    try {
      const response = await nodes.getAll();
      const allNodes = response.data.data.nodes;
      setNodeTypes(allNodes);

      // Group by category
      const grouped = allNodes.reduce((acc, node) => {
        if (!acc[node.category]) {
          acc[node.category] = [];
        }
        acc[node.category].push(node);
        return acc;
      }, {});
      setCategories(grouped);
    } catch (error) {
      console.error('Failed to load node types:', error);
    }
  };

  const filteredCategories = Object.keys(categories).reduce((acc, category) => {
    const filtered = categories[category].filter((node) =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="w-64 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Nodes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {Object.keys(filteredCategories).map((category) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {category}
            </h3>
            <div className="space-y-2">
              {filteredCategories[category].map((node) => (
                <button
                  key={node.id}
                  onClick={() => onAddNode(node)}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-[#0a0a0a] hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-transparent dark:border-gray-800 dark:hover:border-primary-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{node.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                        {node.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {node.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
