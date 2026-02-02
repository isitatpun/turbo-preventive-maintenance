import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ClipboardCheck, 
  Calendar,
  User
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const MobileNav = () => {
  const { isManager } = useAuthStore();

  const managerItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
    { icon: ClipboardCheck, label: 'Approvals', path: '/approvals' },
    { icon: Calendar, label: 'Schedule', path: '/calendar' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const technicianItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: ClipboardList, label: 'Tasks', path: '/my-tasks' },
    { icon: Calendar, label: 'Schedule', path: '/calendar' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const items = isManager() ? managerItems : technicianItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 z-50 safe-bottom">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'text-primary-500' 
                  : 'text-gray-400 active:text-gray-600 active:scale-95'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;