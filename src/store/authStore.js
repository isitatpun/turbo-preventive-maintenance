import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ==================== STATE ====================
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      viewingAs: 'manager', // Renamed from 'viewMode' to match Sidebar

      // ==================== EMAIL/PASSWORD LOGIN ====================
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login(email, password);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            // Set initial view based on actual role
            viewingAs: user.role === 'technician' ? 'technician' : 'manager'
          });
          return user;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // ==================== GOOGLE SSO LOGIN ====================
loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          // 👇 FIX: Pass window.location.origin to ensure they come back 
          // to THIS specific app (e.g., turbo-preventive-maintenance)
          // instead of the default "Parking System" URL.
          await authService.signInWithGoogle(window.location.origin);
          
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      handleGoogleCallback: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.handleGoogleCallback();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            // Ensure safe fallbacks for viewingAs
            viewingAs: user?.role === 'technician' ? 'technician' : 'manager'
          });
          return user;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // ==================== LOGOUT ====================
      logout: () => {
        const user = get().user;
        if (user?.auth_provider === 'google') {
          authService.signOutGoogle().catch(console.error);
        }
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          viewingAs: 'manager'
        });
        localStorage.removeItem('pm-auth-storage');
      },

      // ==================== VIEW SWITCHING (MASTER ADMIN) ====================
      // This matches the function name in your Sidebar
      switchViewAs: (role) => {
        console.log('Switching view to:', role);
        set({ viewingAs: role });
      },

      // This logic prioritizes the "View As" role for admins
      getEffectiveRole: () => {
        const { user, viewingAs } = get();
        if (!user) return null;
        
        // If Master Admin, return the role they are pretending to be
        if (user.role === 'master_admin') {
          return viewingAs;
        }
        
        // Otherwise return their real role
        return user.role;
      },

      // ==================== SESSION MANAGEMENT ====================
      validateSession: async () => {
        const user = get().user;
        if (!user) return false;

        try {
          const validUser = await authService.validateSession(user.id);
          if (!validUser) {
            get().logout();
            return false;
          }
          set({ user: validUser });
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      refreshUser: async () => {
        const user = get().user;
        if (!user) return null;

        try {
          const freshUser = await authService.validateSession(user.id);
          if (freshUser) {
            set({ user: freshUser });
            return freshUser;
          }
          return null;
        } catch (error) {
          console.error('Error refreshing user:', error);
          return null;
        }
      },

      // ==================== ERROR HANDLING ====================
      clearError: () => set({ error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // ==================== HELPER FUNCTIONS ====================
      hasRole: (role) => {
        const user = get().user;
        return user?.role === role;
      },

      isMasterAdmin: () => {
        const user = get().user;
        return user?.role === 'master_admin';
      },

      // Note: This checks the REAL user role, not the effective/view role
      isManager: () => {
        const user = get().user;
        return user?.role === 'manager' || user?.role === 'master_admin';
      },

      isTechnician: () => {
        const user = get().user;
        return user?.role === 'technician';
      },
    }),
    {
      name: 'pm-auth-storage',
      // Ensure 'viewingAs' is saved so it persists on refresh
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        viewingAs: state.viewingAs 
      }),
    }
  )
);

export default useAuthStore;