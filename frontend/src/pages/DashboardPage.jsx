import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, isClient } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        await authAPI.getMe();

        const { data } = await projectsAPI.list({
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          status: 'OPEN',
        });
        setProjects(data?.data?.projects || []);
      } catch (err) {
        setError('Could not load dashboard data.');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-24 md:pb-0">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8 pb-12">
        {/* Welcoming Header */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary mb-2">
                Welcome back, {user?.firstName}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                {isClient 
                  ? "Manage your projects and find great talent."
                  : "Find your next big project today. Check out the latest opportunities matching your expertise."}
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                {isClient ? 'Ready to hire' : 'Available for work'}
              </span>
            </div>
          </div>
        </section>

        {/* Search & Categories Bento */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-12">
          {/* Search Bar */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  type="text"
                  placeholder="Search for jobs, skills, or companies..."
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md font-body-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                Find {isClient ? 'Talent' : 'Jobs'}
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-label-sm font-label-sm text-outline mr-2">Recent:</span>
              {['React Developer', 'UX Audit', 'Tailwind CSS'].map(term => (
                <button 
                  key={term}
                  onClick={() => navigate(`/projects?search=${encodeURIComponent(term)}`)}
                  className="px-3 py-1 bg-surface-container rounded-full text-label-sm font-label-sm text-on-surface-variant hover:bg-outline-variant/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Category Slider (Compact) */}
          <div className="lg:col-span-4 bg-primary text-on-primary p-6 rounded-xl shadow-md overflow-hidden relative group">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor"></circle></pattern></defs>
                <rect width="100%" height="100%" fill="url(#dots)"></rect>
              </svg>
            </div>
            <h3 className="font-headline-md text-headline-md mb-4 relative z-10">Quick Categories</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar relative z-10">
              {[
                { name: 'Web Dev', icon: 'code', skill: 'React' },
                { name: 'Design', icon: 'palette', skill: 'Figma' },
                { name: 'Writing', icon: 'edit_note', skill: 'Copywriting' },
                { name: 'Marketing', icon: 'trending_up', skill: 'SEO' },
              ].map(cat => (
                <button 
                  key={cat.name}
                  onClick={() => navigate(`/projects?skill=${encodeURIComponent(cat.skill)}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all border border-white/5 w-24"
                >
                  <span className="material-symbols-outlined">{cat.icon}</span>
                  <span className="text-label-sm font-label-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area: Recommended Feed */}
        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 sticky top-24">
              <h4 className="font-headline-md text-headline-md text-primary mb-6">Filter Projects</h4>
              <div className="space-y-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-3">Job Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline text-primary focus:ring-primary" />
                      <span className="font-body-sm text-body-sm group-hover:text-primary">Fixed Price</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-outline text-primary focus:ring-primary" />
                      <span className="font-body-sm text-body-sm group-hover:text-primary">Hourly</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-3">Experience Level</label>
                  <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 font-body-sm text-body-sm">
                    <option>Intermediate ($$)</option>
                    <option>Expert ($$$)</option>
                    <option>Entry Level ($)</option>
                  </select>
                </div>
                
                <button 
                  onClick={() => navigate('/projects')}
                  className="w-full py-2 bg-surface-container rounded-lg text-primary font-label-md hover:bg-surface-container-high transition-colors"
                >
                  Advanced Search →
                </button>
              </div>
            </div>
          </aside>

          {/* Job Feed */}
          <section className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-lg text-headline-lg text-on-background">Recommended for You</h3>
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-outline">Sort by:</span>
                <button className="flex items-center gap-1 font-label-md text-label-md text-primary">
                  Newest First
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 text-center rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
                <h3 className="font-headline-md text-primary mb-2">No projects found</h3>
                <p className="text-on-surface-variant mb-6">Try adjusting your filters or search terms.</p>
                <Link to="/projects" className="px-6 py-2 bg-primary text-white rounded-lg font-label-md inline-block">
                  Browse All Projects
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="job-card bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-secondary"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          {project.client?.topRated && (
                            <span className="text-label-sm font-label-sm text-secondary bg-secondary-container/30 px-2 py-0.5 rounded">Verified Client</span>
                          )}
                          <span className="text-label-sm font-label-sm text-on-surface-variant">
                            Posted {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-headline-md text-headline-md text-primary group-hover:text-secondary transition-colors mb-2">
                          {project.title}
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.skillsRequired?.slice(0, 5).map(skill => (
                            <span key={skill} className="px-3 py-1 bg-surface-container rounded text-label-sm font-label-sm text-on-surface-variant">
                              {skill}
                            </span>
                          ))}
                          {project.skillsRequired?.length > 5 && (
                            <span className="px-3 py-1 bg-surface-container rounded text-label-sm font-label-sm text-on-surface-variant">
                              +{project.skillsRequired.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 flex flex-col items-end gap-2 text-right">
                        <span className="font-headline-md text-headline-md text-on-background">${Number(project.budget).toLocaleString()}</span>
                        <span className="font-label-sm text-label-sm text-outline">Fixed Price</span>
                        
                        {project.client?.avgRating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-label-md text-label-md text-on-background">{project.client.avgRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && projects.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Link to="/projects" className="px-10 py-3 border border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-95 inline-block">
                  Load More Projects
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Floating Action Button (FAB) - Desktop Only contextually for job search */}
      {isClient && (
        <div className="hidden lg:block fixed bottom-10 right-10 z-40">
          <Link to="/projects/new" className="bg-secondary text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
            <span className="material-symbols-outlined">add</span>
            <span className="absolute right-full mr-4 bg-primary text-white px-4 py-2 rounded-lg text-label-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Post a Project
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
