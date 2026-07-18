import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

// ============================================================================
// Freelancer Sidebar Nav Item
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

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeNav = location.pathname;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authAPI.getMe();
        setProfile(data.data.user);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
  };

  if (loading || !profile) return <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner"></div></div>;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: '#f8fafc' }}>
      
      {/* ----------------- SIDEBAR ----------------- */}
      <aside style={{
        width: '260px', minWidth: '260px', background: '#eef2f6',
        padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '6px',
        position: 'sticky', top: '72px', height: 'calc(100vh - 72px)', overflowY: 'auto',
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '24px 20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: '16px', border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', background: '#142175', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '24px', fontWeight: '800', marginBottom: '16px'
          }}>
            {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase() || 'R'}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#142175', marginBottom: '6px' }}>
            {profile.firstName} {profile.lastName}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>
            {profile.topRated ? 'Top Rated Freelancer' : 'Freelancer'}
          </p>
          <p style={{ fontSize: '15px', color: '#10b981', fontWeight: '700' }}>
            ${profile.hourlyRate || '45'}/hr
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[
            { icon: 'home', label: 'Dashboard / Home', path: '/dashboard' },
            { icon: 'search', label: 'Browse Jobs / Search', path: '/projects' },
            { icon: 'task', label: 'My Workroom / Tasks', path: '/workroom' },
            { icon: 'chat_bubble', label: 'Messages / Chat', path: '/messages' },
            { icon: 'person', label: 'My Profile & Handoff', path: '/profile' },
          ].map(item => (
            <FreelancerSidebarItem
              key={item.path} icon={item.icon} label={item.label} path={item.path}
              active={activeNav === item.path} onClick={handleNavClick}
            />
          ))}
        </div>
      </aside>

      {/* ----------------- MAIN CONTENT ----------------- */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: '1200px' }}>
        
        {/* Top Profile Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ position: 'relative' }}>
            <img src={profile.avatarUrl || 'https://i.pravatar.cc/150?img=11'} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #eef2f6' }} />
            <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#059669', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 'bold' }}>verified</span>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#142175' }}>{profile.firstName} {profile.lastName}</h1>
              {profile.topRated && (
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                  TOP RATED PLUS
                </span>
              )}
            </div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#142175', marginBottom: '8px' }}>
              {profile.jobTitle || 'Senior React Frontend Architect & UI Designer'}
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10b981' }}>location_on</span>
              {profile.location || 'San Francisco, CA (Remote)'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#0d1c2e' }}>Your Hourly Rate: <span style={{ color: '#142175', fontWeight: '800' }}>${profile.hourlyRate || '45'}/hr</span></p>
              <button style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Edit rate</button>
            </div>
          </div>
        </div>

        {/* Four Stat Cards Row */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          {[
            { icon: 'emoji_events', label: 'TOTAL EARNINGS', value: `$${profile.recentEarnings || '150k+'}` },
            { icon: 'workspace_premium', label: 'COMPLETED JOBS', value: `${profile.stats?.completed || 0} Successful` },
            { icon: 'schedule', label: 'HOURS TRACKED', value: `${profile.activeHours || 0} Hours` },
            { icon: 'work', label: 'ACTIVE CONTRACTS', value: `${profile.stats?.inProgress || 0} Active` },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '24px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#142175' }}>{stat.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>{stat.label}</p>
                <p style={{ fontSize: '18px', fontWeight: '800', color: '#0d1c2e' }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lower Two Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Professional Summary */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#142175', marginBottom: '20px' }}>Professional Summary</h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                {profile.bio || `I am a professional, performance-driven frontend architect specialized in building high-fidelity client dashboards, real-time data visualizers, and interactive design prototypes. I rely on modern component frameworks, strict TypeScript typing schemas, and pixel-perfect layouts to hand off scalable, production-ready systems.
                
My design direction values cleanliness, tight whitespace pairings, and action-oriented focus layouts that translate complex fintech metrics into understandable interfaces.`}
              </p>
            </div>

            {/* Core Expertise & Skills */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#142175', marginBottom: '20px' }}>Core Expertise & Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {(profile.skills && profile.skills.length > 0 ? profile.skills : ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Figma', 'UI/UX Design', 'Redux / Zustand', 'WebSockets']).map(skill => (
                  <span key={skill} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#142175', fontSize: '14px', fontWeight: '600', padding: '8px 16px', borderRadius: '8px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Reviews */}
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#142175', marginBottom: '24px' }}>
                Latest Client Reviews 
                {profile.stats?.avgRating > 0 && ` (${profile.stats.avgRating.toFixed(1)} `}
                {profile.stats?.avgRating > 0 && <span style={{ color: '#142175' }}>★</span>}
                {profile.stats?.avgRating > 0 && ')'}
              </h3>
              
              {!profile.reviews || profile.reviews.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>No reviews yet.</p>
              ) : (
                profile.reviews.map((review, idx) => (
                  <div key={idx} style={{ marginBottom: idx === profile.reviews.length - 1 ? '0' : '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#142175' }}>
                        {review.reviewer?.firstName} {review.reviewer?.lastName}
                      </h4>
                      <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>star</span> {Number(review.rating).toFixed(1)}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{review.comment}"
                    </p>
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

export default ProfilePage;
