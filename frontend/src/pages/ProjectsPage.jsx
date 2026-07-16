// =============================================================================
// src/pages/ProjectsPage.jsx – Browse Projects (Advanced Search)
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchResultCard from '../components/SearchResultCard';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minBudget: '',
    maxBudget: '',
    skill: '',
  });
  const { isClient } = useAuth();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Remove empty string values from params before sending
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const { data } = await projectsAPI.list(params);
      setProjects(data?.data?.projects ?? []);
      setPagination(data?.meta ?? null);
    } catch (err) {
      console.error('Projects fetch error:', err?.response?.data || err.message);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearch = (e) => {
    setFilters((f) => ({ ...f, search: e.target.value, page: 1 }));
  };

  const handleFilter = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1, limit: 10, search: '', status: '', sortBy: 'createdAt', sortOrder: 'desc', minBudget: '', maxBudget: '', skill: ''
    });
  };

  return (
    <div className="page-layout">
      {/* Header section */}
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Browse Projects</h1>
        </div>
        {isClient && (
          <Link to="/projects/new" className="btn btn--primary">
            + Post Project
          </Link>
        )}
      </div>

      {/* 2-Column Layout */}
      <div className="flex gap-6" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Sidebar Filters */}
        <aside className="card" style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '100px', alignSelf: 'flex-start' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: 'var(--color-primary)' }}>Filter Results</h3>
          
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Search Keywords</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, API..."
              value={filters.search}
              onChange={handleSearch}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Category (Skill)</label>
            <div className="flex-col gap-2">
              {['React', 'Node.js', 'Python', 'Design', 'Marketing'].map(cat => (
                <label key={cat} className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="category"
                    checked={filters.skill === cat}
                    onChange={() => handleFilter('skill', cat)}
                  />
                  <span style={{ fontSize: '14px' }}>{cat}</span>
                </label>
              ))}
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="category"
                    checked={filters.skill === ''}
                    onChange={() => handleFilter('skill', '')}
                  />
                  <span style={{ fontSize: '14px' }}>All Categories</span>
                </label>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Budget Range ($)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                className="form-input" 
                placeholder="Min" 
                value={filters.minBudget}
                onChange={e => handleFilter('minBudget', e.target.value)}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>-</span>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Max" 
                value={filters.maxBudget}
                onChange={e => handleFilter('maxBudget', e.target.value)}
              />
            </div>
          </div>
          
          <button 
            className="btn btn--secondary" 
            style={{ width: '100%' }}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </aside>

        {/* Results List */}
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          
          {/* Quick Filters Pill Bar */}
          <div className="flex items-center gap-3 hide-scrollbar" style={{ overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingRight: '8px' }}>Quick Filters:</span>
            {['OPEN', 'IN_PROGRESS', 'COMPLETED'].map(status => {
              const isSelected = filters.status === status;
              return (
                <button 
                  key={status}
                  onClick={() => handleFilter('status', isSelected ? '' : status)}
                  style={{
                    background: isSelected ? 'var(--color-secondary)' : 'var(--color-bg-surface)',
                    color: isSelected ? '#fff' : 'var(--color-text-primary)',
                    border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {status.replace('_', ' ')}
                </button>
              );
            })}
          </div>
          
          {/* Main Top Bar */}
          <div className="flex justify-between items-center" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
             <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
               Showing <strong style={{ color: 'var(--color-text-primary)' }}>{pagination?.total ?? 0}</strong> relevant projects
             </p>
             <div className="flex items-center gap-2">
               <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Sort by:</span>
               <select
                  className="form-select"
                  style={{ width: '160px', padding: '6px 12px', fontSize: '13px' }}
                  value={filters.sortBy}
                  onChange={(e) => handleFilter('sortBy', e.target.value)}
                >
                  <option value="createdAt">Newest First</option>
                  <option value="budget">Highest Budget</option>
                  <option value="deadline">Closing Soon</option>
                </select>
             </div>
          </div>
          
          {error && <div className="alert alert--error" style={{ marginBottom: '24px' }}>{error}</div>}

          {/* Results Array */}
          {loading ? (
            <div className="spinner-wrapper" style={{ minHeight: '300px' }}>
              <div className="spinner" />
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <h3 className="empty-state__title">No projects found</h3>
              <p className="empty-state__desc">Try adjusting your search or filters.</p>
              <button className="btn btn--secondary" onClick={clearFilters} style={{ marginTop: '16px' }}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="flex-col gap-4">
               {projects.map(p => <SearchResultCard key={p.id} project={p} />)}
            </div>
          )}

          {/* Pagination styled as numerical list */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center" style={{ marginTop: '40px' }}>
              <nav className="flex items-center gap-2">
                <button
                  className="btn btn--secondary"
                  style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handleFilter('page', pagination.page - 1)}
                >
                  ←
                </button>
                
                {/* Simple page numbers */}
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  const isCurrent = pNum === pagination.page;
                  // Only show 5 pages around current
                  if (pNum === 1 || pNum === pagination.totalPages || Math.abs(pNum - pagination.page) <= 1) {
                    return (
                      <button
                        key={pNum}
                        className={isCurrent ? "btn btn--primary" : "btn btn--secondary"}
                        style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isCurrent ? 1 : 0.7 }}
                        onClick={() => handleFilter('page', pNum)}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  // Ellipsis
                  if (Math.abs(pNum - pagination.page) === 2) {
                    return <span key={pNum} style={{ color: 'var(--color-text-muted)' }}>...</span>;
                  }
                  return null;
                })}

                <button
                  className="btn btn--secondary"
                  style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={!pagination.hasNextPage}
                  onClick={() => handleFilter('page', pagination.page + 1)}
                >
                  →
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
