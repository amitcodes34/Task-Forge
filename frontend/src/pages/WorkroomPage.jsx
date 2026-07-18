import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI, projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// Freelancer Sidebar Nav Item (Dark Blue Active State)
// ============================================================================
const FreelancerSidebarItem = ({ icon, label, path, active, onClick }) => (
  <button
    onClick={() => onClick(path)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: '14px 18px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: active ? '700' : '500',
      fontFamily: 'inherit',
      color: active ? '#fff' : '#64748b',
      background: active ? '#142175' : 'transparent',
      transition: 'all 0.2s',
      textAlign: 'left',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#142175'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
  >
    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
    {label}
  </button>
);

const WorkroomPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeNav = location.pathname;

  const [activeProjects, setActiveProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkroomData = async () => {
      try {
        const { data: profileData } = await authAPI.getMe();
        setProfile(profileData.data.user);

        // Fetch active projects for this freelancer
        const { data: activeData } = await projectsAPI.list({ status: 'IN_PROGRESS' });
        setActiveProjects(activeData?.data?.projects || []);
      } catch (err) {
        setError('Failed to load workroom data');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkroomData();
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
  };

  if (loading || !profile) return <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner"></div></div>;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: '#f9fafb' }}>
      
      {/* Freelancer Sidebar (Same as Dashboard) */}
      <aside style={{
        width: '260px', minWidth: '260px', background: '#f1f5f9',
        padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '6px',
        position: 'sticky', top: '72px', height: 'calc(100vh - 72px)', overflowY: 'auto',
      }}>
        {/* Profile Card Widget */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '24px 20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: '16px', border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: '#142175', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '24px', fontWeight: '800', marginBottom: '16px'
          }}>
            {profile?.firstName?.[0]?.toUpperCase()}{profile?.lastName?.[0]?.toUpperCase() || 'R'}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#142175', marginBottom: '6px' }}>
            {profile?.firstName} {profile?.lastName}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>
            {profile?.topRated ? 'Top Rated Freelancer' : 'Freelancer'}
          </p>
          <p style={{ fontSize: '15px', color: '#10b981', fontWeight: '700' }}>
            ${profile?.hourlyRate || '45'}/hr
          </p>
        </div>

        {/* Sidebar Nav Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[
            { icon: 'home', label: 'Dashboard / Home', path: '/dashboard' },
            { icon: 'search', label: 'Browse Jobs / Search', path: '/projects' },
            { icon: 'task', label: 'My Workroom / Tasks', path: '/workroom' },
            { icon: 'chat_bubble', label: 'Messages / Chat', path: '/messages' },
            { icon: 'person', label: 'My Profile & Handoff', path: '/profile' },
          ].map(item => (
            <FreelancerSidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={activeNav === item.path}
              onClick={handleNavClick}
            />
          ))}
        </div>

        {/* Post Brief Service Button */}
        <div style={{ marginTop: '20px' }}>
          <button style={{
            width: '100%', background: '#10b981', color: '#fff', border: 'none',
            borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', transition: 'background 0.2s',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
            Post a Brief Service
          </button>
        </div>
      </aside>

      {/* Workroom Main Content */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '1200px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#142175', marginBottom: '8px' }}>
            My Workroom
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Manage your workflow, submit milestone deliverables, and track project achievements.
          </p>
        </div>

        {/* Stat Cards Row */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          
          {/* Recent Earnings */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '16px' }}>RECENT EARNINGS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#142175' }}>${profile?.recentEarnings || 0}</p>
            </div>
          </div>

          {/* Active Hours */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '16px' }}>ACTIVE HOURS</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#142175' }}>{profile?.activeHours || 0}h</p>
              <span style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>this week</span>
            </div>
          </div>

          {/* Next Deadline */}
          <div style={{ flex: 1.2, background: '#0f766e', borderRadius: '16px', padding: '28px', position: 'relative', overflow: 'hidden', color: '#fff', boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#ccfbf1', letterSpacing: '0.5px', marginBottom: '12px', position: 'relative', zIndex: 2 }}>NEXT DEADLINE</h3>
            <p style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', position: 'relative', zIndex: 2 }}>
              {activeProjects.length > 0 ? activeProjects[0].title : 'No Upcoming Deadlines'}
            </p>
            
            {/* Clock Watermark */}
            <span className="material-symbols-outlined" style={{
              position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '140px',
              color: 'rgba(255,255,255,0.1)', zIndex: 1, pointerEvents: 'none',
              fontVariationSettings: "'wght' 300"
            }}>schedule</span>
          </div>

        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <button style={{
            background: 'none', border: 'none', padding: '0 0 16px 0', borderBottom: '2px solid #142175',
            color: '#142175', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Active Contracts ({activeProjects.length})
          </button>
          <button style={{
            background: 'none', border: 'none', padding: '0 0 16px 0', borderBottom: '2px solid transparent',
            color: '#64748b', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#142175'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
            My Proposals (2)
          </button>
          <button style={{
            background: 'none', border: 'none', padding: '0 0 16px 0', borderBottom: '2px solid transparent',
            color: '#64748b', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#142175'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
            Completed (1)
          </button>
        </div>

        {/* Active Projects List */}
        {activeProjects.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1' }}>desk</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0d1c2e', marginTop: '16px' }}>No active projects</h3>
            <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>You don't have any projects currently in progress.</p>
            <button onClick={() => navigate('/projects')} style={{ background: '#142175', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer' }}>
              Find Work
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {activeProjects.map(project => (
              <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)}
                style={{
                  background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px',
                  cursor: 'pointer', transition: 'box-shadow 0.2s', position: 'relative'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>
                    IN PROGRESS
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#0d1c2e' }}>
                    ${Number(project.budget).toLocaleString()}
                  </span>
                </div>
                
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#142175', marginBottom: '12px' }}>{project.title}</h4>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>
                
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Open Workspace <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </main>
    </div>
  );
};

export default WorkroomPage;
