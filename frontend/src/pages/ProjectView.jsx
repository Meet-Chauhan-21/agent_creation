import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useWorkflowStore } from '../store/workflowStore';
import Navbar from '../components/Navbar';
import { Plus, Workflow as WorkflowIcon, Play, Copy, Trash2, Calendar, ArrowLeft, X, Edit } from 'lucide-react';

export default function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject } = useProjectStore();
  const { workflows, fetchWorkflows, createWorkflow, updateWorkflow, duplicateWorkflow, deleteWorkflow, loading } = useWorkflowStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowTags, setWorkflowTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

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
      tags: workflowTags,
      nodes: [],
      edges: [],
    });

    if (result.success) {
      setShowCreateModal(false);
      setWorkflowName('');
      setWorkflowDescription('');
      setWorkflowTags([]);
      setTagInput('');
      navigate(`/workflows/${result.workflow._id}`);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() && workflowTags.length < 10) {
      e.preventDefault();
      if (!workflowTags.includes(tagInput.trim())) {
        setWorkflowTags([...workflowTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setWorkflowTags(workflowTags.filter(tag => tag !== tagToRemove));
  };

  const handleEditWorkflow = (e, workflow) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingWorkflow(workflow);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description || '');
    setWorkflowTags(workflow.tags || []);
    setShowEditModal(true);
  };

  const handleUpdateWorkflow = async (e) => {
    e.preventDefault();
    const result = await updateWorkflow(editingWorkflow._id, {
      name: workflowName,
      description: workflowDescription,
      tags: workflowTags,
    });

    if (result.success) {
      setShowEditModal(false);
      setEditingWorkflow(null);
      setWorkflowName('');
      setWorkflowDescription('');
      setWorkflowTags([]);
      setTagInput('');
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
                className="group animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card p-5 border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 bg-white dark:bg-[#1a1a1a]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {workflow.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {workflow.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {workflow.tags && workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {workflow.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                      {workflow.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium">
                          +{workflow.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-primary-500" />
                      <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-2.5 py-1 rounded-md font-semibold">
                      v{workflow.version}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/workflows/${workflow._id}`);
                      }}
                      className="flex-1 btn btn-primary text-sm py-2.5 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Play className="w-4 h-4" />
                      <span>Open</span>
                    </button>
                    <button
                      onClick={(e) => handleEditWorkflow(e, workflow)}
                      className="btn btn-secondary p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Edit Workflow"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDuplicateWorkflow(e, workflow._id);
                      }}
                      className="btn btn-secondary p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Duplicate Workflow"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteWorkflow(e, workflow._id);
                      }}
                      className="btn p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800"
                      title="Delete Workflow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

              <div>
                <label htmlFor="workflowTagInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags <span className="text-xs text-gray-500">(max 10)</span>
                </label>
                <input
                  id="workflowTagInput"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                  className="input"
                  placeholder="Type a tag and press Enter"
                  disabled={workflowTags.length >= 10}
                />
                {workflowTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {workflowTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-800 dark:hover:text-purple-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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

      {/* Edit Workflow Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl max-w-md w-full p-6 dark:border dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Workflow</h2>

            <form onSubmit={handleUpdateWorkflow} className="space-y-4">
              <div>
                <label htmlFor="editWorkflowName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workflow Name
                </label>
                <input
                  id="editWorkflowName"
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="input"
                  placeholder="My Workflow"
                  required
                />
              </div>

              <div>
                <label htmlFor="editWorkflowDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="editWorkflowDescription"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="What does this workflow do?"
                />
              </div>

              <div>
                <label htmlFor="editWorkflowTagInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags <span className="text-xs text-gray-500">(max 10)</span>
                </label>
                <input
                  id="editWorkflowTagInput"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                  className="input"
                  placeholder="Type a tag and press Enter"
                  disabled={workflowTags.length >= 10}
                />
                {workflowTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {workflowTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-800 dark:hover:text-purple-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingWorkflow(null);
                    setWorkflowName('');
                    setWorkflowDescription('');
                    setWorkflowTags([]);
                    setTagInput('');
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn btn-primary"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
