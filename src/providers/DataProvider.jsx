import React, { createContext, useContext, useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated, refreshUser } = useAuthStore();
  const { fetchTasks, fetchCategories, fetchLocations } = useTaskStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated || !user) {
        setIsInitialized(true);
        return;
      }

      try {
        setError(null);
        
        // Optional: Refresh user data
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }

        // Fetch app data
        await Promise.all([
          fetchTasks(),
          fetchCategories(),
          fetchLocations()
        ]);
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err.message);
        setIsInitialized(true);
      }
    };

    initializeData();
  }, [isAuthenticated, user?.id]);

  const value = {
    isInitialized,
    error,
    retry: () => {
      setIsInitialized(false);
      setError(null);
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;