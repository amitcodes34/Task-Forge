import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNavBar = () => {
  const location = useLocation();
  const { isClient } = useAuth();

  const isActive = (path) => location.pathname === path;

  const getNavItems = () => {
    if (isClient) {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
        { name: 'Post Job', path: '/projects/new', icon: 'add_circle' },
        { name: 'Messages', path: '/messages', icon: 'mail' },
        { name: 'Profile', path: '/profile', icon: 'person' },
      ];
    } else {
      return [
        { name: 'Jobs', path: '/dashboard', icon: 'work' },
        { name: 'Workroom', path: '/workroom', icon: 'task_alt' },
        { name: 'Messages', path: '/messages', icon: 'mail' },
        { name: 'Profile', path: '/profile', icon: 'person' },
      ];
    }
  };

  return (
    <nav className="bottom-nav-mobile">
      {getNavItems().map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
        >
          <span
            className="material-symbols-outlined mb-1"
            style={{ 
              fontSize: '24px', 
              fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" 
            }}
          >
            {item.icon}
          </span>
          <span className="text-label-sm">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNavBar;
