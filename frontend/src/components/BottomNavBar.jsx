import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNavBar = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: 'home' },
    { name: 'Search', path: '/projects', icon: 'search' },
    { name: 'Tasks', path: '/workroom', icon: 'assignment' },
    { name: 'Messages', path: '/messages', icon: 'mail' },
    { name: 'Profile', path: '/profile', icon: 'person' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full flex justify-around items-center py-2 px-2 bg-surface dark:bg-surface z-[100] border-t border-outline-variant dark:border-outline shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-150 ${
            isActive(item.path)
              ? 'text-secondary dark:text-secondary-fixed-dim font-bold'
              : 'text-on-surface-variant dark:text-on-surface-variant hover:text-secondary'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}
          >
            {item.icon}
          </span>
          <span className="font-label-sm text-label-sm">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNavBar;
