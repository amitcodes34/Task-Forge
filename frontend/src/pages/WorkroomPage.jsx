import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, projectsAPI } from '../services/api';

const WorkroomPage = () => {
  const { user, isClient, isFreelancer } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const loadWorkroom = async () => {
      setLoading(true);
      try {
        const userRes = await authAPI.getMe();
        setStats(userRes.data?.data?.user?.stats);
        const fetchedUser = userRes.data?.data?.user;

        if (fetchedUser.role === 'FREELANCER') {
          // Bids are returned inside the auth me endpoint typically? 
          // If not, we might need a separate call. For now we use what we can.
          // In a real app we'd fetch the bids explicitly.
        }
      } catch (err) {
        console.error('Workroom load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkroom();
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen pb-24 md:pb-0">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Left Sidebar Profile (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 text-center sticky top-24">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-surface-container">
                <img 
                  src={user?.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.firstName + ' ' + user?.lastName)} 
                  alt={user?.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-headline-md text-primary mb-1">{user?.firstName} {user?.lastName}</h3>
              <p className="text-on-surface-variant text-label-md mb-4">{user?.jobTitle || (isClient ? 'Client' : 'Freelancer')}</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {user?.topRated && (
                  <span className="px-3 py-1 bg-secondary-container/30 text-secondary font-label-sm rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Top Rated
                  </span>
                )}
              </div>

              <div className="space-y-3 text-left pt-6 border-t border-outline-variant/30">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-body-sm">Hourly Rate</span>
                  <span className="font-label-md">${user?.hourlyRate || 'N/A'}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-body-sm">Location</span>
                  <span className="font-label-md">{user?.location || 'Remote'}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Area */}
          <div className="lg:col-span-9 space-y-6">
            <h2 className="font-headline-xl text-primary mb-6">My Workroom</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-container/20 text-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">payments</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Recent Earnings</p>
                    <p className="font-headline-lg text-primary">${user?.recentEarnings?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-secondary-container/20 text-secondary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">schedule</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Active Hours</p>
                    <p className="font-headline-lg text-primary">{user?.activeHours || '0'}h</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-error-container/20 text-error rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">event_available</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Next Deadline</p>
                    <p className="font-headline-lg text-primary">No upcoming</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-outline-variant/30 mb-6">
              <button 
                onClick={() => setActiveTab('active')}
                className={`pb-4 font-label-md transition-colors relative ${activeTab === 'active' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Active Contracts ({stats?.inProgress || stats?.active || 0})
                {activeTab === 'active' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`pb-4 font-label-md transition-colors relative ${activeTab === 'pending' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Pending Proposals ({stats?.pendingProposals || 0})
                {activeTab === 'pending' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`pb-4 font-label-md transition-colors relative ${activeTab === 'completed' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Completed ({stats?.completed || 0})
                {activeTab === 'completed' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
              </button>
            </div>

            {/* Content Area */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 text-center min-h-[300px] flex flex-col justify-center items-center">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
              </div>
              <h3 className="font-headline-md text-primary mb-2">No {activeTab} records found</h3>
              <p className="text-on-surface-variant max-w-md">
                {activeTab === 'active' && "You don't have any active contracts right now. Explore jobs to find your next opportunity!"}
                {activeTab === 'pending' && "You haven't submitted any proposals that are currently pending."}
                {activeTab === 'completed' && "You don't have any completed contracts yet."}
              </p>
              
              {activeTab === 'active' && isFreelancer && (
                <Link to="/projects" className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-label-md hover:opacity-90 transition-opacity">
                  Find Work
                </Link>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkroomPage;
