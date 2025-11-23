import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useWorkflowStore } from '../store/workflowStore';
import Navbar from '../components/Navbar';
import { Plus, Workflow as WorkflowIcon, Play, Copy, Trash2, Calendar, ArrowLeft } from 'lucide-react';

export default function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject } = useProjectStore();
  const { workflows, fetchWorkflows, createWorkflow, duplicateWorkflow, deleteWorkflow, loading } = useWorkflowStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchWorkflows(projectId);
    }
  }, [projectId]);

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    const result = await createWorkflow(projectId, {
      name: workflowName,
      description: workflowDescription,
      nodes: [],
      edges: [],
    });

    if (result.success) {
      setShowCreateModal(false);
      setWorkflowName('');
      setWorkflowDescription('');
      navigate(`/workflows/${result.workflow._id}`);
    }
  };

  const handleDuplicateWorkflow = async (e, workflowId) => {
    e.stopPropagation();
    await duplicateWorkflow(workflowId);
  };

  const handleDeleteWorkflow = async (e, workflowId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflow(workflowId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="group relative flex items-center space-x-2 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-500 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:text-white dark:hover:text-white overflow-hidden mb-4"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            <ArrowLeft className="w-4 h-4 relative z-10 transition-transform group-hover:-translate-x-1" />
            <span className="relative z-10">Back to Projects</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentProject?.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{currentProject?.description || 'No description'}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span>New Workflow</span>
            </button>
          </div>
        </div>

        {loading && workflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12">
            <WorkflowIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workflows yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Create your first workflow to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow, index) => (
              <div
                key={workflow._id}
                onClick={() => navigate(`/workflows/${workflow._id}`)}
                className="relative card cursor-pointer group hover-lift animate-slide-up overflow-hidden border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-600 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        {workflow.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {workflow.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-primary-500" />
                      <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-2 py-1 rounded-md font-semibold">
                      v{workflow.version}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workflows/${workflow._id}`);
                    }}
                    className="flex-1 btn btn-secondary text-xs py-1.5 flex items-center justify-center space-x-1 hover:scale-105 transition-transform"
                  >
                    <Play className="w-3 h-3" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={(e) => handleDuplicateWorkflow(e, workflow._id)}
                    className="btn btn-secondary text-xs py-1.5 px-2 hover:scale-110 transition-transform"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteWorkflow(e, workflow._id)}
                    className="btn text-xs py-1.5 px-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl max-w-md w-full p-6 dark:border dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Workflow</h2>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label htmlFor="workflowName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workflow Name
                </label>
                <input
                  id="workflowName"
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="input"
                  placeholder="My Workflow"
                  required
                />
              </div>

              <div>
                <label htmlFor="workflowDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="workflowDescription"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="What does this workflow do?"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn btn-primary"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
