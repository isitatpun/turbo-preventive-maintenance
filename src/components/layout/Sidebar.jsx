import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ClipboardCheck, 
  History, 
  Calendar, 
  BarChart3, 
  Users, 
  Settings,
  FileText,
  ChevronDown,
  LogOut,
  X,
  Wrench
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { USER_ROLES } from '../../data/constants';
import logoImage from '../../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const { user, isManager, isMasterAdmin, viewingAs, switchViewAs, getEffectiveRole, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const managerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ClipboardList, label: 'All Tasks', path: '/tasks' },
    { icon: ClipboardCheck, label: 'Approvals', path: '/approvals' },
    { icon: History, label: 'Task History', path: '/history' },
    { icon: Calendar, label: 'Schedule', path: '/calendar' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: FileText, label: 'Documentation', path: '/docs' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const technicianMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ClipboardList, label: 'My Tasks', path: '/my-tasks' },
    { icon: History, label: 'Task History', path: '/history' },
    { icon: Calendar, label: 'Schedule', path: '/calendar' }
  ];

  const effectiveRole = getEffectiveRole();
  const menuItems = effectiveRole === 'technician' ? technicianMenuItems : managerMenuItems;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100/80 flex flex-col z-50">
      
      {/* Decorated Header Section */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <img 
              src={logoImage} 
              alt="Logo" 
              className="w-6 h-6 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
            <Wrench className="w-5 h-5 text-primary-600 absolute" style={{ zIndex: -1 }} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">PM System</h1>
            <p className="text-primary-100 text-xs font-medium capitalize">
              {effectiveRole === USER_ROLES.MANAGER ? 'Manager' : 
               effectiveRole === USER_ROLES.MASTER_ADMIN ? 'Admin' : 'Technician'} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Admin Quick View Switcher */}
      {isMasterAdmin() && (
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2 px-1">Role Preview</p>
          <div className="flex gap-1.5 p-1 bg-white/50 rounded-xl border border-amber-100">
            <button
              onClick={() => switchViewAs(USER_ROLES.MANAGER)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewingAs === USER_ROLES.MANAGER
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-100'
              }`}
            >
              Manager
            </button>
            <button
              onClick={() => switchViewAs(USER_ROLES.TECHNICIAN)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewingAs === USER_ROLES.TECHNICIAN
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-100'
              }`}
            >
              Techician
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-200 ease-out
                ${isActive 
                  ? 'bg-primary-500 shadow-lg shadow-primary-500/25' // Active state container
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]' // Inactive state container
                }
              `}
            >
              {/* Force text-white on Icon when active */}
              <Icon 
                className={`w-[18px] h-[18px] ${isActive ? 'text-white' : ''}`} 
                strokeWidth={isActive ? 2 : 1.5} 
              />
              {/* Force text-white on Label when active */}
              <span className={isActive ? 'text-white' : ''}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-100/80">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100 text-primary-600 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">
                {isMasterAdmin() ? 'Master Admin' : effectiveRole?.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;