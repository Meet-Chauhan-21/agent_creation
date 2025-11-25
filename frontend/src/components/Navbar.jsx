import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import ConfirmModal from './ConfirmModal';
import { LogOut, User, Workflow, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Workflow className="w-8 h-8 text-primary-600 dark:text-primary-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Agent Platform</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Projects
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="group relative flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-500 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:text-white dark:hover:text-white overflow-hidden hover:shadow-xl hover:shadow-primary-500/30 dark:hover:shadow-primary-600/30"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 dark:from-primary-500 dark:via-purple-500 dark:to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></span>
              <User className="w-4 h-4 relative z-10 transition-all duration-300 group-hover:rotate-[360deg] group-hover:scale-110" />
              <span className="relative z-10 font-semibold">{user?.name || user?.email}</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5 transition-transform" /> : <Sun className="w-5 h-5 transition-transform" />}
            </button>
            <button
              onClick={handleLogout}
              className="group relative flex items-center space-x-1.5 text-red-600 dark:text-red-400 border-2 border-transparent hover:border-red-600 dark:hover:border-red-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:text-white dark:hover:text-white overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <LogOut className="w-4 h-4 relative z-10 transition-transform group-hover:rotate-12" />
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModal}
        setIsOpen={setLogoutModal}
        onConfirm={confirmLogout}
        title="Logout?"
        message="Are you sure you want to logout? Any unsaved changes will be lost."
        confirmText="Logout"
        cancelText="Cancel"
        type="logout"
      />
    </nav>
  );
}
