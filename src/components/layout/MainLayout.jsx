import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import useAuthStore from '../../store/authStore';

const MainLayout = ({ children }) => {
  const { isManager } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8 page-transition">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;