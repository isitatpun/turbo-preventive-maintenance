import { create } from 'zustand';
import { taskService, categoryService, locationService } from '../services';

const useTaskStore = create((set, get) => ({
  tasks: [],
  categories: [],
  locations: [],
  isLoading: false,
  error: null,

  // Fetch all data
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [tasks, categories, locations] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll(),
        locationService.getAll()
      ]);
      set({ tasks, categories, locations, isLoading: false });
      return { tasks, categories, locations };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch tasks only
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getAll();
      set({ tasks, isLoading: false });
      return tasks;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    try {
      const categories = await categoryService.getAll();
      set({ categories });
      return categories;
    } catch (error) {
      console.error('Fetch categories error:', error);
      throw error;
    }
  },

  // Fetch locations
  fetchLocations: async () => {
    try {
      const locations = await locationService.getAll();
      set({ locations });
      return locations;
    } catch (error) {
      console.error('Fetch locations error:', error);
      throw error;
    }
  },

  // Create task
  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await taskService.create(taskData);
      set(state => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false
      }));
      return newTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Bulk create tasks
  bulkCreateTasks: async (tasksData) => {
    set({ isLoading: true, error: null });
    try {
      const newTasks = await taskService.bulkCreate(tasksData);
      set(state => ({
        tasks: [...newTasks, ...state.tasks],
        isLoading: false
      }));
      return newTasks;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update task
  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.update(id, taskData);
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updatedTask } : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.delete(id);
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Claim task
  claimTask: async (taskId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.claim(taskId, userId);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Unclaim task
  unclaimTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.unclaim(taskId);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Submit task
  submitTask: async (taskId, submitData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.submit(taskId, submitData);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Approve task
  approveTask: async (taskId, approverId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.approve(taskId, approverId);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Reject task
  rejectTask: async (taskId, newDueDate, reason) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.reject(taskId, newDueDate, reason);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Approve task request (requested → open)
  approveTaskRequest: async (taskId, approverId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.approveRequest(taskId, approverId);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Reject task request (requested → rejected)
  rejectTaskRequest: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.rejectRequest(taskId);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Acknowledge rejected task request (technician dismisses → delete)
  acknowledgeRejectedTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.delete(taskId);
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Add category
  addCategory: async (categoryData) => {
    try {
      const newCategory = await categoryService.create(categoryData);
      set(state => ({
        categories: [...state.categories, newCategory]
      }));
      return newCategory;
    } catch (error) {
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const updatedCategory = await categoryService.update(id, categoryData);
      set(state => ({
        categories: state.categories.map(c => c.id === id ? updatedCategory : c)
      }));
      return updatedCategory;
    } catch (error) {
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      await categoryService.delete(id);
      set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Add location
  addLocation: async (locationData) => {
    try {
      const newLocation = await locationService.create(locationData);
      set(state => ({
        locations: [...state.locations, newLocation]
      }));
      return newLocation;
    } catch (error) {
      throw error;
    }
  },

  // Update location
  updateLocation: async (id, locationData) => {
    try {
      const updatedLocation = await locationService.update(id, locationData);
      set(state => ({
        locations: state.locations.map(l => l.id === id ? updatedLocation : l)
      }));
      return updatedLocation;
    } catch (error) {
      throw error;
    }
  },

  // Delete location
  deleteLocation: async (id) => {
    try {
      await locationService.delete(id);
      set(state => ({
        locations: state.locations.filter(l => l.id !== id)
      }));
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useTaskStore;