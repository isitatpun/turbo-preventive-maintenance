import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DataProvider from './providers/DataProvider';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import TaskHistory from './pages/TaskHistory';

// Technician Pages
import MyTasks from './pages/technician/MyTasks';

// Manager Pages
import TaskManagement from './pages/manager/TaskManagement';
import Approvals from './pages/manager/Approvals';
import Reports from './pages/manager/Reports';
import Users from './pages/manager/Users';
import Settings from './pages/manager/Settings';
import Documentation from './pages/manager/Documentation';

import useAuthStore from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <DataProvider>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    {/* Common Routes */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/history" element={<TaskHistory />} />
                    
                    {/* Technician Routes */}
                    <Route path="/my-tasks" element={<MyTasks />} />

                    {/* Manager Routes */}
                    <Route path="/tasks" element={<TaskManagement />} />
                    <Route path="/approvals" element={<Approvals />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/docs" element={<Documentation />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </DataProvider>
    </Router>
  );
}



export default App;