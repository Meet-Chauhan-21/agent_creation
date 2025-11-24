import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import { User, Mail, Lock, Save, Eye, EyeOff, Folder, Workflow, Calendar, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { users } from '../lib/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, updatePassword } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // History data
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'activity'

  useEffect(() => {
    loadUserHistory();
  }, []);

  const loadUserHistory = async () => {
    setLoadingHistory(true);
    try {
      const [projectsRes, workflowsRes] = await Promise.all([
        users.getProjects(),
        users.getWorkflows(),
      ]);
      setRecentProjects(projectsRes.data.data.projects || []);
      setRecentWorkflows(workflowsRes.data.data.workflows || []);
    } catch (error) {
      console.error('Failed to load user history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await updateProfile({ name, email });
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }
    
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    const result = await updatePassword(currentPassword, newPassword);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update password' });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          <button
            onClick={() => window.history.back()}
            className="group relative flex items-center space-x-2 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-500 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:text-white dark:hover:text-white overflow-hidden mb-6"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            <svg className="w-4 h-4 relative z-10 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="relative z-10">Back</span>
          </button>
          
          {/* Profile Header */}
          <div className="card mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-primary-100 dark:ring-primary-900/30">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{user?.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Folder className="w-4 h-4" />
                      <span>{recentProjects.length} Projects</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Workflow className="w-4 h-4" />
                      <span>{recentWorkflows.length} Workflows</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
                  Active
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'security'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Security</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activity'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Activity</span>
                </div>
              </button>
            </nav>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg animate-slide-down ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span>Profile Information</span>
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="group relative text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:text-white dark:hover:text-white overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                    <span className="relative z-10">Edit Profile</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className="input disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className="input disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3 pt-4 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setName(user?.name || '');
                          setEmail(user?.email || '');
                        }}
                        className="flex-1 btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn btn-primary flex items-center justify-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-2">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span>Change Password</span>
              </h2>

              <form onSubmit={handleUpdatePassword}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Recent Projects */}
              <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Recent Projects</span>
                  </h2>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No projects yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProjects.slice(0, 5).map((project) => (
                      <div
                        key={project._id}
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {project.workflowCount} workflow{project.workflowCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Workflows */}
              <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Workflow className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>Recent Workflows</span>
                  </h2>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                  </div>
                ) : recentWorkflows.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Workflow className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No workflows yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentWorkflows.slice(0, 5).map((workflow) => (
                      <div
                        key={workflow._id}
                        onClick={() => navigate(`/workflows/${workflow._id}`)}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {workflow.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                              {workflow.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {workflow.projectId?.name || 'Unknown Project'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-xs font-medium">
                            v{workflow.version}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
