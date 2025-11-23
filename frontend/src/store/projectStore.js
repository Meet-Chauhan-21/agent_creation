import { create } from 'zustand';
import { projects } from '../lib/api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await projects.getAll();
      set({ projects: response.data.data.projects, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch projects',
        loading: false,
      });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await projects.getOne(id);
      set({ currentProject: response.data.data.project, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch project',
        loading: false,
      });
    }
  },

  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await projects.create(data);
      const newProject = response.data.data.project;
      set((state) => ({
        projects: [newProject, ...state.projects],
        loading: false,
      }));
      return { success: true, project: newProject };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateProject: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await projects.update(id, data);
      const updatedProject = response.data.data.project;
      set((state) => ({
        projects: state.projects.map((p) => (p._id === id ? updatedProject : p)),
        currentProject:
          state.currentProject?._id === id ? updatedProject : state.currentProject,
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update project';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await projects.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },
}));
