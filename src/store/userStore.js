import { create } from 'zustand';
import { userService } from '../services';

const useUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  // Fetch all users
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getAll();
      set({ users, isLoading: false });
      return users;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get user by ID
  getUserById: (id) => {
    const { users } = get();
    return users.find(u => u.id === id);
  },

  // Get technicians
  getTechnicians: () => {
    const { users } = get();
    return users.filter(u => u.role === 'technician' && u.isActive);
  },

  // Add user
  addUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = await userService.create(userData);
      set(state => ({ 
        users: [newUser, ...state.users],
        isLoading: false 
      }));
      return newUser;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.update(id, userData);
      set(state => ({
        users: state.users.map(u => u.id === id ? updatedUser : u),
        isLoading: false
      }));
      return updatedUser;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userService.delete(id);
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useUserStore;