// =============================================================================
// src/components/Navbar.jsx – Application Navigation Bar
// =============================================================================

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Freelancer specific nav styling
  const isFreelancer = isAuthenticated && !isClient && !isAdmin;

  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const NavLink = ({ to, label, isFreelancerView }) => {
    const active = isActive(to);
    
    if (isFreelancerView) {
      return (
        <Link
          to={to}
          style={{
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: active ? '600' : '500',
            color: active ? '#142175' : '#64748b',
            background: active ? '#e6eeff' : 'transparent',
            padding: '8px 16px',
            borderRadius: '999px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if(!active) e.currentTarget.style.color = '#142175'; }}
          onMouseLeave={e => { if(!active) e.currentTarget.style.color = '#64748b'; }}
        >
          {label}
        </Link>
      );
    }
    
    // Default styling for Client/Admin/Public
    return (
      <Link 
        to={to} 
        className={active ? 'navbar__link navbar__link--active' : 'navbar__link'}
        style={active ? { color: 'var(--color-primary)' } : {}}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Left: Logo & Menu Icon (if freelancer) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isFreelancer && (
            <span className="material-symbols-outlined" style={{ color: '#142175', fontSize: '24px', cursor: 'pointer' }}>menu</span>
          )}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: '800',
            color: '#142175',
            letterSpacing: '-0.5px'
          }}>
            <div style={{
              width: '32px', height: '32px', background: '#142175', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              fontSize: '18px', fontWeight: 'bold'
            }}>TF</div>
            TaskForge
          </Link>
        </div>

        {/* Center: Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isFreelancer ? (
            <>
              <NavLink to="/dashboard" label="Home" isFreelancerView />
              <NavLink to="/projects" label="Browse Jobs" isFreelancerView />
              <NavLink to="/workroom" label="Workroom" isFreelancerView />
              <NavLink to="/messages" label="Messages" isFreelancerView />
            </>
          ) : (
            <>
              <NavLink to="/projects" label="Browse Projects" />
              {isAuthenticated && <NavLink to="/dashboard" label="Dashboard" />}
              {isAdmin && <NavLink to="/admin" label="Admin" />}
            </>
          )}
        </div>

        {/* Right: Actions & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isAuthenticated ? (
            <>
              {isFreelancer && (
                <>
                  {/* Available Badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#d1fae5', padding: '6px 14px', borderRadius: '999px',
                    border: '1px solid #059669', cursor: 'pointer'
                  }}>
                    <div style={{ width: '8px', height: '8px', background: '#059669', borderRadius: '50%' }}></div>
                    <span style={{ color: '#065f46', fontSize: '13px', fontWeight: '600' }}>Available</span>
                  </div>
                  
                  {/* Search Icon */}
                  <span className="material-symbols-outlined" style={{ color: '#64748b', fontSize: '22px', cursor: 'pointer' }}>search</span>
                </>
              )}

              {/* User Avatar & Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleLogout} title="Click to Logout">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #142175, #006b5c)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '16px', fontWeight: '700'
                    }}>
                      {user?.firstName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {/* Online dot for freelancer */}
                  {isFreelancer && (
                    <div style={{
                      position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px',
                      background: '#10b981', border: '2px solid #fff', borderRadius: '50%'
                    }}></div>
                  )}
                </div>
                {!isFreelancer && (
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
                   onClick={handleLogout}
                 >
                   Sign Out
                 </button>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#64748b', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                Log In
              </Link>
              <Link to="/register" style={{
                background: '#142175', color: '#fff', padding: '10px 20px', borderRadius: '8px',
                fontWeight: '600', fontSize: '14px', textDecoration: 'none'
              }}>
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
