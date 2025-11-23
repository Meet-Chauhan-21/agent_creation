import { create } from 'zustand';
import { workflows, runs as runsApi } from '../lib/api';

export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  runs: [],
  loading: false,
  error: null,

  fetchWorkflows: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const response = await workflows.getAll(projectId);
      set({ workflows: response.data.data.workflows, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch workflows',
        loading: false,
      });
    }
  },

  fetchWorkflow: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await workflows.getOne(id);
      set({ currentWorkflow: response.data.data.workflow, loading: false });
      return response.data.data.workflow;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch workflow',
        loading: false,
      });
      return null;
    }
  },

  createWorkflow: async (projectId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await workflows.create(projectId, data);
      const newWorkflow = response.data.data.workflow;
      set((state) => ({
        workflows: [newWorkflow, ...state.workflows],
        loading: false,
      }));
      return { success: true, workflow: newWorkflow };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create workflow';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateWorkflow: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await workflows.update(id, data);
      const updatedWorkflow = response.data.data.workflow;
      set((state) => ({
        workflows: state.workflows.map((w) => (w._id === id ? updatedWorkflow : w)),
        currentWorkflow:
          state.currentWorkflow?._id === id ? updatedWorkflow : state.currentWorkflow,
        loading: false,
      }));
      return { success: true, workflow: updatedWorkflow };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update workflow';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  duplicateWorkflow: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await workflows.duplicate(id);
      const duplicatedWorkflow = response.data.data.workflow;
      set((state) => ({
        workflows: [duplicatedWorkflow, ...state.workflows],
        loading: false,
      }));
      return { success: true, workflow: duplicatedWorkflow };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to duplicate workflow';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteWorkflow: async (id) => {
    set({ loading: true, error: null });
    try {
      await workflows.delete(id);
      set((state) => ({
        workflows: state.workflows.filter((w) => w._id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete workflow';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  runWorkflow: async (id, input = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await workflows.run(id, input);
      const run = response.data.data.run;
      return { success: true, run };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to run workflow';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchRuns: async (workflowId) => {
    set({ loading: true, error: null });
    try {
      const response = await workflows.getRuns(workflowId);
      set({ runs: response.data.data.runs, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch runs',
        loading: false,
      });
    }
  },
}));
