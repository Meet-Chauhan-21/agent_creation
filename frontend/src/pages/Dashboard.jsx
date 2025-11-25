import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, Folder, Calendar, Trash2, Edit, Copy, X } from 'lucide-react';

export default function Dashboard() {
  const { projects, fetchProjects, createProject, updateProject, duplicateProject, deleteProject, loading } = useProjectStore();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTags, setProjectTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [duplicatingProjectId, setDuplicatingProjectId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const result = await createProject({
      name: projectName,
      description: projectDescription,
      tags: projectTags,
    });

    if (result.success) {
      setShowCreateModal(false);
      setProjectName('');
      setProjectDescription('');
      setProjectTags([]);
      setTagInput('');
    }
  };

  const handleEditProject = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setProjectTags(project.tags || []);
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    const result = await updateProject(editingProject._id, {
      name: projectName,
      description: projectDescription,
      tags: projectTags,
    });

    if (result.success) {
      setShowEditModal(false);
      setEditingProject(null);
      setProjectName('');
      setProjectDescription('');
      setProjectTags([]);
      setTagInput('');
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() && projectTags.length < 10) {
      e.preventDefault();
      if (!projectTags.includes(tagInput.trim())) {
        setProjectTags([...projectTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setProjectTags(projectTags.filter(tag => tag !== tagToRemove));
  };

  const handleDuplicateProject = async (e, projectId) => {
    e.stopPropagation();
    setDuplicatingProjectId(projectId);
    try {
      const result = await duplicateProject(projectId);
      if (result.success) {
        console.log('Project duplicated successfully');
      } else {
        console.error('Failed to duplicate project:', result.error);
      }
    } catch (error) {
      console.error('Error duplicating project:', error);
    } finally {
      setDuplicatingProjectId(null);
    }
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, projectId });
  };

  const confirmDeleteProject = async () => {
    if (deleteModal.projectId) {
      await deleteProject(deleteModal.projectId);
      setDeleteModal({ isOpen: false, projectId: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your workflow projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span>New Project</span>
          </button>
        </div>

        {loading && projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first project</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="group animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative card p-6 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 bg-white dark:bg-[#1a1a1a]">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-bl-[100px] -z-0"></div>
                  
                  <div className="relative z-10">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white">
                              {project.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a]"></div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[40px]">
                      {project.description || 'No description provided for this project.'}
                    </p>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-md text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats Bar */}
                    <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Project</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(project.updatedAt || project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/projects/${project._id}`);
                        }}
                        className="flex-1 btn btn-primary text-sm py-2.5 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <Folder className="w-4 h-4" />
                        <span>Open</span>
                      </button>
                      <button
                        onClick={(e) => handleEditProject(e, project)}
                        className="btn btn-secondary p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Edit Project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDuplicateProject(e, project._id);
                        }}
                        disabled={duplicatingProjectId === project._id}
                        className={`btn btn-secondary p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          duplicatingProjectId === project._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Duplicate Project"
                      >
                        {duplicatingProjectId === project._id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteProject(e, project._id);
                        }}
                        className="btn p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl max-w-md w-full p-6 dark:border dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Project</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="input"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="What is this project about?"
                />
              </div>

              <div>
                <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags <span className="text-xs text-gray-500">(max 10)</span>
                </label>
                <input
                  id="tagInput"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                  className="input"
                  placeholder="Type a tag and press Enter"
                  disabled={projectTags.length >= 10}
                />
                {projectTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {projectTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-primary-800 dark:hover:text-primary-200"
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

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl max-w-md w-full p-6 dark:border dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Project</h2>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  id="editProjectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="input"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div>
                <label htmlFor="editProjectDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="editProjectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="What is this project about?"
                />
              </div>

              <div>
                <label htmlFor="editTagInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags <span className="text-xs text-gray-500">(max 10)</span>
                </label>
                <input
                  id="editTagInput"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                  className="input"
                  placeholder="Type a tag and press Enter"
                  disabled={projectTags.length >= 10}
                />
                {projectTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {projectTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-primary-800 dark:hover:text-primary-200"
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
                    setEditingProject(null);
                    setProjectName('');
                    setProjectDescription('');
                    setProjectTags([]);
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        setIsOpen={(isOpen) => setDeleteModal({ isOpen, projectId: null })}
        onConfirm={confirmDeleteProject}
        title="Delete Project?"
        message="Are you sure you want to delete this project? This will also delete all workflows. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Success Modal */}
      <ConfirmModal
        isOpen={successModal.isOpen}
        setIsOpen={(isOpen) => setSuccessModal({ isOpen, message: '' })}
        onConfirm={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Success!"
        message={successModal.message}
        confirmText="Got it!"
        cancelText=""
        type="success"
      />
    </div>
  );
}
