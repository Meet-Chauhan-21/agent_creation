import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import Navbar from '../components/Navbar';
import NodePalette from '../components/workflow/NodePalette';
import NodePropertiesPanel from '../components/workflow/NodePropertiesPanel';
import RunPanel from '../components/workflow/RunPanel';
import CustomNode from '../components/workflow/CustomNode';
import { Save, Play, ArrowLeft, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

const nodeTypes = {
  custom: CustomNode,
};

export default function WorkflowEditor() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { currentWorkflow, fetchWorkflow, updateWorkflow, runWorkflow } = useWorkflowStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showRunPanel, setShowRunPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    }

    // Setup socket connection
    socketRef.current = io(WS_URL);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [workflowId]);

  const loadWorkflow = async () => {
    const workflow = await fetchWorkflow(workflowId);
    if (workflow) {
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
      setLastSaved(new Date(workflow.updatedAt));
    }
  };

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleAddNode = useCallback(
    (nodeType) => {
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position: {
          x: Math.random() * 500,
          y: Math.random() * 300,
        },
        data: {
          label: nodeType.name,
          nodeType: nodeType.id,
          icon: nodeType.icon,
          category: nodeType.category,
          parameters: {},
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleNodeUpdate = useCallback(
    (nodeId, data) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    const result = await updateWorkflow(workflowId, {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.nodeType,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
      version: currentWorkflow?.version,
    });

    if (result.success) {
      setLastSaved(new Date());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleRun = async () => {
    const result = await runWorkflow(workflowId, {});
    if (result.success) {
      setShowRunPanel(true);
      
      // Subscribe to run updates
      if (socketRef.current) {
        socketRef.current.emit('subscribe:run', result.run._id);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />

      {/* Top Bar */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/projects/${currentWorkflow?.projectId}`)}
              className="group relative flex items-center space-x-2 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-500 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:text-white dark:hover:text-white overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <ArrowLeft className="w-4 h-4 relative z-10 transition-transform group-hover:-translate-x-1" />
              <span className="relative z-10">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentWorkflow?.name || 'Workflow'}
              </h1>
              {lastSaved && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-secondary flex items-center space-x-2 hover:scale-105 transition-all relative"
            >
              {isSaving ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 32 32" fill="none">
                  <circle className="stroke-gray-300 dark:stroke-gray-700" cx="16" cy="16" r="14" strokeWidth="4" />
                  <circle
                    className="stroke-primary-600 dark:stroke-primary-500"
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    strokeWidth="4"
                    strokeDashoffset="75"
                    strokeDasharray="100"
                    strokeLinecap="round"
                  />
                </svg>
              ) : saveSuccess ? (
                <svg className="w-4 h-4 text-green-500 animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}</span>
            </button>
            <button
              onClick={handleRun}
              className="btn btn-primary flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Run</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        <NodePalette onAddNode={handleAddNode} />

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-100 dark:bg-[#0a0a0a]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="dark:bg-[#0a0a0a]"
          >
            <Background className="dark:bg-[#0a0a0a]" gap={16} color="#4B5563" />
            <Controls />
            <MiniMap 
              maskColor="rgba(0, 0, 0, 0.6)"
              nodeColor="#a855f7"
              nodeBorderRadius={8}
            />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <NodePropertiesPanel
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Run Panel */}
        {showRunPanel && (
          <RunPanel
            workflowId={workflowId}
            socket={socketRef.current}
            onClose={() => setShowRunPanel(false)}
          />
        )}
      </div>
    </div>
  );
}
