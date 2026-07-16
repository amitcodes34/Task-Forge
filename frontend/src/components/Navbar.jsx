// =============================================================================
// src/components/Navbar.jsx – Application Navigation Bar
// Corporate / Modern Design System
// =============================================================================

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/projects') {
      return location.pathname.startsWith('/projects')
        ? 'navbar__link navbar__link--active'
        : 'navbar__link';
    }
    return location.pathname === path ? 'navbar__link navbar__link--active' : 'navbar__link';
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span style={{ fontSize: '24px', color: 'var(--color-accent)' }}>⬢</span>
          TaskForge
        </Link>

        {/* Nav Links */}
        <div className="navbar__links">
          <Link to="/projects" className={isActive('/projects')}>
            Browse Projects
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className={isActive('/admin')}>
                  Admin
                </Link>
              )}
              {/* User chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px 4px 6px',
                  background: 'var(--color-bg-base)',
                  borderRadius: '9999px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                  }}
                >
                  {user?.firstName}
                  <span
                    style={{
                      color: 'var(--color-accent)',
                      marginLeft: '6px',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  >
                    {user?.role}
                  </span>
                </span>
              </div>
              <button
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-danger)';
                  e.currentTarget.style.borderColor = 'var(--color-danger-light)';
                  e.currentTarget.style.background = '#fff1f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid transparent',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.background = 'var(--color-bg-base)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn btn--primary"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
