// =============================================================================
// src/pages/ProjectsPage.jsx – Browse Projects (Mobile-First Responsive)
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchResultCard from '../components/SearchResultCard';

const SKILLS = ['React', 'Node.js', 'Python', 'Design', 'Marketing'];

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false); // mobile filter drawer
  const [filters, setFilters] = useState({
    page: 1, limit: 10, search: '',
    status: '', sortBy: 'createdAt',
    sortOrder: 'desc', minBudget: '', maxBudget: '', skill: '',
  });
  const { isClient } = useAuth();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
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

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const clearFilters = () => setFilters({
    page: 1, limit: 10, search: '', status: '',
    sortBy: 'createdAt', sortOrder: 'desc', minBudget: '', maxBudget: '', skill: ''
  });

  const activeFilterCount = [filters.skill, filters.status, filters.minBudget, filters.maxBudget].filter(Boolean).length;

  // ---- Filter Panel (shared between sidebar & drawer) ----
  const FilterPanel = () => (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Search Keywords</label>
        <input
          type="text"
          style={inputStyle}
          placeholder="e.g. React, API, Design..."
          value={filters.search}
          onChange={e => handleFilter('search', e.target.value)}
        />
      </div>

      {/* Skill */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Category (Skill)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          {SKILLS.map(cat => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#454651' }}>
              <input
                type="radio"
                name="category-filter"
                checked={filters.skill === cat}
                onChange={() => handleFilter('skill', cat)}
                style={{ accentColor: '#142175', width: '16px', height: '16px' }}
              />
              {cat}
            </label>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#454651' }}>
            <input
              type="radio"
              name="category-filter"
              checked={filters.skill === ''}
              onChange={() => handleFilter('skill', '')}
              style={{ accentColor: '#142175', width: '16px', height: '16px' }}
            />
            All Categories
          </label>
        </div>
      </div>

      {/* Budget */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Budget Range ($)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <input
            type="number"
            style={{ ...inputStyle, margin: 0 }}
            placeholder="Min"
            value={filters.minBudget}
            onChange={e => handleFilter('minBudget', e.target.value)}
          />
          <span style={{ color: '#94a3b8', flexShrink: 0 }}>–</span>
          <input
            type="number"
            style={{ ...inputStyle, margin: 0 }}
            placeholder="Max"
            value={filters.maxBudget}
            onChange={e => handleFilter('maxBudget', e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={() => { clearFilters(); setShowFilters(false); }}
        style={{
          width: '100%', padding: '10px', borderRadius: '8px',
          border: '1px solid #e2e8f0', background: '#fff',
          color: '#64748b', fontSize: '14px', fontWeight: '600',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <>
      {/* ---- MOBILE FILTER OVERLAY ---- */}
      {showFilters && (
        <div
          onClick={() => setShowFilters(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 200, display: 'block',
          }}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px',
        background: '#fff', zIndex: 201, padding: '24px',
        transform: showFilters ? 'translateX(0)' : 'translateX(-110%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto', boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#142175' }}>Filters</h3>
          <button
            onClick={() => setShowFilters(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#64748b', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <FilterPanel />
      </div>

      {/* ---- PAGE CONTENT ---- */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 120px' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: '800', color: '#0d1c2e', lineHeight: 1.2 }}>
              Browse Projects
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              Find your next opportunity from hundreds of open projects
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isClient && (
              <Link
                to="/projects/new"
                style={{
                  background: '#142175', color: '#fff', textDecoration: 'none',
                  padding: '10px 18px', borderRadius: '8px', fontSize: '14px',
                  fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>+</span> Post Project
              </Link>
            )}
          </div>
        </div>

        {/* Mobile: Search bar + Filter button row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
            style={{
              flex: 1, padding: '11px 14px', border: '1px solid #e2e8f0',
              borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
              outline: 'none', minWidth: 0,
              background: '#fff',
            }}
            onFocus={e => e.target.style.borderColor = '#142175'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          {/* Filter button: visible on mobile only */}
          <button
            onClick={() => setShowFilters(true)}
            style={{
              padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '8px',
              background: activeFilterCount > 0 ? '#142175' : '#fff',
              color: activeFilterCount > 0 ? '#fff' : '#454651',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
              whiteSpace: 'nowrap',
            }}
            className="filter-btn-mobile"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span>
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: '#fff', color: '#142175', borderRadius: '99px',
                width: '18px', height: '18px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px', fontWeight: '800',
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Status Pills */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '20px',
          overflowX: 'auto', paddingBottom: '4px',
        }}>
          {[{ label: 'All', val: '' }, { label: 'Open', val: 'OPEN' }, { label: 'In Progress', val: 'IN_PROGRESS' }, { label: 'Completed', val: 'COMPLETED' }].map(({ label, val }) => {
            const active = filters.status === val;
            return (
              <button
                key={val}
                onClick={() => handleFilter('status', val)}
                style={{
                  padding: '7px 16px', borderRadius: '99px', border: `1.5px solid ${active ? '#142175' : '#e2e8f0'}`,
                  background: active ? '#142175' : '#fff',
                  color: active ? '#fff' : '#454651',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 2-col layout: sidebar (desktop) + results */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* Sidebar — hidden on mobile, shown ≥ 768px */}
          <aside className="projects-sidebar" style={{
            width: '260px', flexShrink: 0,
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '24px',
            position: 'sticky', top: '88px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#142175', marginBottom: '20px' }}>
              Filter Results
            </h3>
            <FilterPanel />
          </aside>

          {/* Results column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Top bar: count + sort */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Showing <strong style={{ color: '#0d1c2e' }}>{projects.length}</strong> projects
              </p>
              <select
                value={filters.sortBy}
                onChange={e => handleFilter('sortBy', e.target.value)}
                style={{
                  padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '13px', fontFamily: 'inherit', background: '#fff',
                  color: '#454651', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="createdAt">Newest First</option>
                <option value="budget">Highest Budget</option>
                <option value="deadline">Closing Soon</option>
              </select>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                padding: '12px 16px', color: '#991b1b', fontSize: '14px', marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div className="spinner" />
              </div>
            ) : projects.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 24px',
                background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0d1c2e', marginBottom: '8px' }}>No projects found</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={clearFilters}
                  style={{
                    background: '#142175', color: '#fff', border: 'none', borderRadius: '8px',
                    padding: '10px 20px', fontSize: '14px', fontWeight: '600',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projects.map(p => <SearchResultCard key={p.id} project={p} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleFilter('page', filters.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  style={pageBtn(false, !pagination.hasPrevPage)}
                >
                  ←
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1) {
                    return (
                      <button
                        key={p}
                        onClick={() => handleFilter('page', p)}
                        style={pageBtn(p === pagination.page, false)}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (Math.abs(p - pagination.page) === 2) {
                    return <span key={p} style={{ alignSelf: 'center', color: '#94a3b8' }}>…</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => handleFilter('page', filters.page + 1)}
                  disabled={!pagination.hasNextPage}
                  style={pageBtn(false, !pagination.hasNextPage)}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive CSS injected via style tag */}
      <style>{`
        .projects-sidebar { display: none; }
        .filter-btn-mobile { display: flex !important; }

        @media (min-width: 768px) {
          .projects-sidebar { display: block !important; }
          .filter-btn-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
};

// Helper styles
const labelStyle = {
  display: 'block', fontSize: '13px', fontWeight: '600',
  color: '#454651', marginBottom: '8px',
};

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
  borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};

const pageBtn = (active, disabled) => ({
  width: '36px', height: '36px', borderRadius: '8px',
  border: `1.5px solid ${active ? '#142175' : '#e2e8f0'}`,
  background: active ? '#142175' : '#fff',
  color: active ? '#fff' : '#454651',
  fontSize: '14px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  opacity: disabled ? 0.4 : 1, fontFamily: 'inherit',
  transition: 'all 0.15s',
});

export default ProjectsPage;
