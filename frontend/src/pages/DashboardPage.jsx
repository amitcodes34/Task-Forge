import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { projectsAPI, authAPI, freelancersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// Sidebar Nav Item (General)
// ============================================================================
const SidebarItem = ({ icon, label, path, active, onClick }) => (
  <button
    onClick={() => onClick(path)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: active ? '600' : '500',
      fontFamily: 'inherit',
      color: active ? '#142175' : '#64748b',
      background: active ? 'rgba(20,33,117,0.08)' : 'transparent',
      transition: 'all 0.18s',
      textAlign: 'left',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#142175'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
  >
    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
    {label}
  </button>
);

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

// ============================================================================
// Stat Card
// ============================================================================
const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '12px',
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="material-symbols-outlined" style={{ color, fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
    <div>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '22px', fontWeight: '700', color: '#0d1c2e' }}>{value}</p>
    </div>
  </div>
);

// ============================================================================
// Freelancer Card (AI Recommended)
// ============================================================================
const FreelancerCard = ({ freelancer }) => {
  const score = freelancer.aiMatchScore || 82;
  const scoreColor = score >= 90 ? '#059669' : score >= 75 ? '#006b5c' : '#142175';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,33,117,0.1)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #142175, #2e3a8c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '20px', fontWeight: '700', flexShrink: 0,
          }}>
            {freelancer.firstName?.[0]?.toUpperCase()}{freelancer.lastName?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0d1c2e' }}>
                {freelancer.firstName} {freelancer.lastName}
              </h4>
              {freelancer.topRated && (
                <span style={{
                  background: '#fef3c7', color: '#92400e', fontSize: '10px',
                  padding: '2px 7px', borderRadius: '99px', fontWeight: '600',
                }}>⭐ TOP RATED</span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              {freelancer.skills?.slice(0, 2).join(' · ') || 'Freelancer'}
            </p>
          </div>
        </div>

        <div style={{
          textAlign: 'center', background: scoreColor + '10',
          border: `1.5px solid ${scoreColor}30`, borderRadius: '10px', padding: '8px 12px',
        }}>
          <p style={{ fontSize: '20px', fontWeight: '800', color: scoreColor, lineHeight: 1 }}>{score}%</p>
          <p style={{ fontSize: '10px', color: scoreColor, fontWeight: '600', marginTop: '2px' }}>AI Match</p>
        </div>
      </div>

      <p style={{
        fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {freelancer.bio || 'Experienced professional ready to take on your project.'}
      </p>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {freelancer.skills?.slice(0, 5).map(skill => (
          <span key={skill} style={{
            background: '#e6eeff', color: '#142175', fontSize: '12px',
            padding: '4px 10px', borderRadius: '99px', fontWeight: '500',
          }}>{skill}</span>
        ))}
        {(freelancer.skills?.length || 0) > 5 && (
          <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '12px', padding: '4px 10px', borderRadius: '99px' }}>
            +{freelancer.skills.length - 5}
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Rating</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#0d1c2e', display: 'flex', alignItems: 'center', gap: '3px' }}>
              ⭐ {freelancer.avgRating > 0 ? Number(freelancer.avgRating).toFixed(1) : 'New'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Jobs Done</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#0d1c2e' }}>{freelancer.completedJobs || 0}</p>
          </div>
          {freelancer.hourlyRate > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Rate</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#006b5c' }}>${freelancer.hourlyRate}/hr</p>
            </div>
          )}
        </div>
        <button style={{
          background: '#142175', color: '#fff', border: 'none', borderRadius: '8px',
          padding: '8px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          fontFamily: 'inherit', transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#2e3a8c'}
          onMouseLeave={e => e.currentTarget.style.background = '#142175'}
        >
          Invite to Job
        </button>
      </div>
    </div>
  );
};

const ActiveJobRow = ({ project, onClick }) => {
  const statusColors = {
    OPEN: { bg: '#d1fae5', color: '#065f46', label: 'Open' },
    IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
    DELIVERED: { bg: '#fef3c7', color: '#92400e', label: 'Delivered' },
    COMPLETED: { bg: '#e0e7ff', color: '#3730a3', label: 'Completed' },
  };
  const st = statusColors[project.status] || statusColors['OPEN'];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <div>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#0d1c2e', marginBottom: '4px' }}>{project.title}</p>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          Budget: <span style={{ color: '#006b5c', fontWeight: '600' }}>${Number(project.budget).toLocaleString()}</span>
          &nbsp;· Posted {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ background: st.bg, color: st.color, fontSize: '12px', padding: '4px 10px', borderRadius: '99px', fontWeight: '600' }}>
          {st.label}
        </span>
        <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: '18px' }}>chevron_right</span>
      </div>
    </div>
  );
};


// ============================================================================
// MAIN COMPONENT
// ============================================================================
const DashboardPage = () => {
  const { user, isClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [talentLoading, setTalentLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('/dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState({ active: 0, spent: 0, hired: 0, proposals: 0 });

  useEffect(() => {
    setActiveNav(location.pathname);
  }, [location]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: profileData } = await authAPI.getMe();
        setProfile(profileData.data.user);

        if (isClient) {
          const res = await projectsAPI.list({ limit: 10 });
          const all = res.data?.data?.projects || [];
          setMyProjects(all);
          const active = all.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS').length;
          const spent = all.reduce((s, p) => p.status === 'COMPLETED' ? s + Number(p.budget) : s, 0);
          const hired = all.filter(p => p.status !== 'OPEN').length;
          setStats({ active, spent, hired, proposals: Math.floor(Math.random() * 20 + 5) });
        } else {
          const res = await projectsAPI.list({ status: 'OPEN', limit: 10 });
          setProjects(res.data?.data?.projects || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const loadTalent = async () => {
      setTalentLoading(true);
      try {
        const res = await freelancersAPI.list();
        setFreelancers(res.data?.data?.freelancers || []);
      } catch (e) { console.error(e); }
      finally { setTalentLoading(false); }
    };
    loadTalent();
  }, [isClient]);

  const handleNavClick = (path) => {
    setActiveNav(path);
    navigate(path);
  };

  // ============================================================================
  // CLIENT VIEW — Upwork-style Sidebar Layout
  // ============================================================================
  if (isClient) {
    const clientNavItems = [
      { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
      { icon: 'work', label: 'My Jobs', path: '/projects' },
      { icon: 'add_circle', label: 'Post a Job', path: '/projects/new' },
      { icon: 'people', label: 'Find Talent', path: '/dashboard' },
      { icon: 'mail', label: 'Messages', path: '/messages' },
    ];

    return (
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: '#f8f9ff' }}>
        {/* ---- SIDEBAR ---- */}
        <aside style={{
          width: '240px', minWidth: '240px', background: '#fff',
          borderRight: '1px solid #e2e8f0', padding: '28px 16px',
          display: 'flex', flexDirection: 'column', gap: '4px',
          position: 'sticky', top: '72px', height: 'calc(100vh - 72px)', overflowY: 'auto',
        }}>
          {/* Profile Mini */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 12px 20px', borderBottom: '1px solid #f1f5f9', marginBottom: '12px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #142175, #006b5c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0,
            }}>
              {user?.firstName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#0d1c2e' }}>{user?.firstName} {user?.lastName}</p>
              <span style={{ fontSize: '11px', background: '#d1fae5', color: '#065f46', padding: '1px 7px', borderRadius: '99px', fontWeight: '600' }}>CLIENT</span>
            </div>
          </div>

          {/* Nav items */}
          {clientNavItems.map(item => (
            <SidebarItem
              key={item.path + item.label}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={activeNav === item.path && item.label !== 'Find Talent'}
              onClick={handleNavClick}
            />
          ))}

          {/* Post Job CTA */}
          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            <button
              onClick={() => navigate('/projects/new')}
              style={{
                width: '100%', background: '#142175', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2e3a8c'}
              onMouseLeave={e => e.currentTarget.style.background = '#142175'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Post a New Job
            </button>
          </div>
        </aside>

        {/* ---- MAIN CONTENT ---- */}
        <main style={{ flex: 1, padding: '32px 32px 100px', overflowY: 'auto' }}>
          {/* Welcome */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0d1c2e', marginBottom: '6px' }}>
              Welcome back, {profile?.firstName || user?.firstName}! 👋
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Here's an overview of your hiring activity today.</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <StatCard icon="work" label="Active Jobs" value={loading ? '...' : stats.active} color="#142175" />
            <StatCard icon="payments" label="Total Spent" value={loading ? '...' : `$${stats.spent.toLocaleString()}`} color="#006b5c" />
            <StatCard icon="handshake" label="Freelancers Hired" value={loading ? '...' : stats.hired} color="#7c3aed" />
            <StatCard icon="description" label="Proposals Received" value={loading ? '...' : stats.proposals} color="#d97706" />
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'flex-start' }}>
            {/* LEFT: AI Talent Feed */}
            <div>
              {/* Search Bar */}
              <div style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0d1c2e', marginBottom: '12px' }}>
                  Find Talent
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Search skills, roles, or freelancer names..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/projects?search=${encodeURIComponent(searchQuery)}`)}
                    style={{
                      flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0',
                      borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
                      outline: 'none', transition: 'border 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#142175'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <button
                    onClick={() => navigate(`/projects?search=${encodeURIComponent(searchQuery)}`)}
                    style={{
                      background: '#142175', color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '10px 20px', fontSize: '14px', fontWeight: '600',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >Search</button>
                </div>

                {/* Quick Category Tags */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {['React', 'Node.js', 'UI/UX', 'Python', 'Figma', 'Mobile Dev'].map(tag => (
                    <button key={tag} style={{
                      background: '#e6eeff', color: '#142175', border: 'none',
                      borderRadius: '99px', padding: '4px 12px', fontSize: '12px',
                      fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                      onClick={() => navigate(`/projects?search=${encodeURIComponent(tag)}`)}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Talent Heading */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0d1c2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#006b5c', fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  AI Recommended Talent
                </h2>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Powered by AI scoring</span>
              </div>

              {talentLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                  <div className="spinner"></div>
                  <p style={{ marginTop: '12px', fontSize: '14px' }}>Finding best matches...</p>
                </div>
              ) : freelancers.length === 0 ? (
                <div style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '48px', textAlign: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#e2e8f0' }}>group_off</span>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#64748b', marginTop: '12px' }}>No freelancers found yet</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Freelancers will appear here once they register on the platform.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {freelancers.map(f => <FreelancerCard key={f.id} freelancer={f} />)}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: My Jobs + Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Actions */}
              <div style={{ background: '#142175', borderRadius: '14px', padding: '24px', color: '#fff' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Ready to hire?</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px', lineHeight: '1.5' }}>
                  Post a new job and start receiving proposals from top talent within hours.
                </p>
                <button
                  onClick={() => navigate('/projects/new')}
                  style={{
                    background: '#fff', color: '#142175', border: 'none', borderRadius: '8px',
                    padding: '11px', width: '100%', fontSize: '14px', fontWeight: '700',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Post a New Job →
                </button>
              </div>

              {/* My Active Jobs */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0d1c2e' }}>My Job Posts</h3>
                  <Link to="/projects" style={{ fontSize: '13px', color: '#142175', fontWeight: '600', textDecoration: 'none' }}>View all</Link>
                </div>

                {loading ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8', padding: '20px 0' }}>Loading...</p>
                ) : myProjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#e2e8f0' }}>work_off</span>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>No jobs posted yet.</p>
                    <button
                      onClick={() => navigate('/projects/new')}
                      style={{
                        marginTop: '12px', background: '#e6eeff', color: '#142175', border: 'none',
                        borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
                        fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  myProjects.slice(0, 5).map(p => (
                    <ActiveJobRow key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
                  ))
                )}
              </div>

              {/* Tips Card */}
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px',
                padding: '20px',
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#065f46', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  Pro Tips
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Write clear job descriptions to get better proposals',
                    'Review AI scores to find the best talent matches',
                    'Communicate clearly and set milestones',
                  ].map((tip, i) => (
                    <li key={i} style={{ fontSize: '12px', color: '#065f46', display: 'flex', gap: '6px' }}>
                      <span style={{ flexShrink: 0, marginTop: '2px' }}>✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================================
  // FREELANCER VIEW (Re-designed to match screenshot)
  // ============================================================================
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: '#f9fafb' }}>
      
      {/* Freelancer Sidebar */}
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

      {/* Freelancer Main Content */}
      <main style={{ flex: 1, padding: '32px 40px 100px', maxWidth: '1200px' }}>
        
        {/* Top Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#142175', marginBottom: '8px' }}>
              Welcome back, {profile?.firstName || user?.firstName}
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Find your next big project today. There are <span style={{ fontWeight: '700', color: '#142175' }}>1,248</span> new jobs matching your <br/>React and UI Design expertise.
            </p>
          </div>
          
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#6ee7b7', padding: '8px 16px', borderRadius: '999px',
          }}>
            <div style={{ width: '8px', height: '8px', background: '#059669', borderRadius: '50%' }}></div>
            <span style={{ color: '#064e3b', fontSize: '14px', fontWeight: '600' }}>Available for work</span>
          </div>
        </div>

        {/* Search & Categories Row */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
          
          {/* Left: Search Box */}
          <div style={{ flex: 2, background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', color: '#94a3b8' }}>search</span>
              <input
                type="text"
                placeholder="Search for jobs, skills, or companies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 48px', background: '#f8fafc',
                  border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px',
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
              <button style={{
                position: 'absolute', right: '8px', background: '#142175', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
              }}>Find Jobs</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>RECENT:</span>
              <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '13px', padding: '6px 14px', borderRadius: '999px', fontWeight: '500' }}>React Developer</span>
              <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '13px', padding: '6px 14px', borderRadius: '999px', fontWeight: '500' }}>UX Audit</span>
              <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '13px', padding: '6px 14px', borderRadius: '999px', fontWeight: '500' }}>Tailwind CSS</span>
            </div>
          </div>

          {/* Right: Quick Categories */}
          <div style={{ flex: 1, background: '#142175', borderRadius: '16px', padding: '24px', color: '#fff' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quick Categories</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { icon: 'code', label: 'Web Dev' },
                { icon: 'palette', label: 'Design' },
                { icon: 'edit', label: 'Writing' }
              ].map(cat => (
                <div key={cat.label} style={{
                  flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{cat.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Lower Content: Filters & Job List */}
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* Left: Filter Projects */}
          <div style={{ width: '280px', flexShrink: 0, background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#142175', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#10b981' }}>filter_alt</span>
                Filter Projects
              </h3>
              <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600', cursor: 'pointer' }}>Reset</span>
            </div>

            {/* JOB TYPE */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Job Type</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#142175' }} />
                <span style={{ fontSize: '14px', color: '#475569' }}>Fixed Price</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#142175' }} />
                <span style={{ fontSize: '14px', color: '#475569' }}>Hourly Rate</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#142175' }} />
                <span style={{ fontSize: '14px', color: '#475569' }}>Hourly</span>
              </label>
            </div>

            {/* EXPERIENCE LEVEL */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Experience Level</h4>
              <select style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                background: '#f8fafc', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: '#475569'
              }}>
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>

            {/* BUDGET LIMIT */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
                Budget Limit <span style={{ textTransform: 'none' }}>($36,500)</span>
              </h4>
              <input type="range" min="0" max="100000" defaultValue="36500" style={{ width: '100%', accentColor: '#10b981' }} />
            </div>
          </div>

          {/* Right: Recommended For You */}
          <div style={{ flex: 1 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0d1c2e' }}>Recommended for You</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', marginTop: '4px' }}>
                  Showing {projects.length || 3} matches
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
                <span style={{ fontWeight: '600', fontSize: '12px' }}>SORT BY:</span>
                <span style={{ fontWeight: '700', color: '#142175' }}>Newest First</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>expand_more</span>
              </div>
            </div>

            {/* Job Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner"></div></div>
              ) : projects.length === 0 ? (
                // Mock Card 1
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Posted 1 day ago</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: '#0d1c2e' }}>$2,000</p>
                      <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>FIXED PRICE</p>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#142175', marginBottom: '12px', paddingRight: '80px' }}>
                    Whitepaper Copywriter for Fintech Company
                  </h3>
                  
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
                    Seeking a professional technical writer with a background in finance to draft a 15-page whitepaper on decentralized banking protocols...
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: '500' }}>Copywriting</span>
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: '500' }}>Fintech</span>
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: '500' }}>Technical Writing</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: '700' }}>VERIFIED CLIENT</span>
                      <span style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⭐ 4.7 <span style={{ color: '#94a3b8', fontSize: '11px' }}>(15)</span>
                      </span>
                    </div>
                  </div>
                  
                  <button style={{
                    position: 'absolute', top: '70px', right: '24px', width: '36px', height: '36px',
                    borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bookmark_border</span>
                  </button>
                </div>
              ) : (
                projects.map(project => (
                  <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)}
                    style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '20px', fontWeight: '800', color: '#0d1c2e' }}>${Number(project.budget).toLocaleString()}</p>
                        <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>FIXED PRICE</p>
                      </div>
                    </div>
                    
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#142175', marginBottom: '12px', paddingRight: '80px' }}>
                      {project.title}
                    </h3>
                    
                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {project.skillsRequired?.slice(0, 4).map(skill => (
                        <span key={skill} style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: '500' }}>{skill}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: '700' }}>VERIFIED CLIENT</span>
                        <span style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⭐ 4.9 <span style={{ color: '#94a3b8', fontSize: '11px' }}>(12)</span>
                        </span>
                      </div>
                    </div>
                    
                    <button style={{
                      position: 'absolute', top: '70px', right: '24px', width: '36px', height: '36px',
                      borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bookmark_border</span>
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
