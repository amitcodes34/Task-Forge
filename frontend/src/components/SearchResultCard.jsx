import { Link } from 'react-router-dom';
import { useState } from 'react';

const SearchResultCard = ({ project }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const budget = parseFloat(project.budget).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const daysAgo = (() => {
    const diff = Math.floor((Date.now() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  })();

  const isUrgent = project.deadline &&
    Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) <= 3;

  const statusConfig = {
    OPEN: { bg: '#d1fae5', color: '#065f46', label: 'Open' },
    IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
    DELIVERED: { bg: '#fef3c7', color: '#92400e', label: 'Delivered' },
    COMPLETED: { bg: '#e0e7ff', color: '#3730a3', label: 'Completed' },
  };
  const st = statusConfig[project.status] || statusConfig['OPEN'];

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '18px 20px',
      borderLeft: '4px solid #142175',
      transition: 'box-shadow 0.15s, border-color 0.15s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(20,33,117,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top row: title + favorite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
        <Link
          to={`/projects/${project.id}`}
          style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
        >
          <h4 style={{
            fontSize: 'clamp(15px, 3vw, 17px)',
            fontWeight: '700',
            color: '#142175',
            lineHeight: '1.3',
            wordBreak: 'break-word',
          }}>
            {project.title}
          </h4>
        </Link>

        <button
          onClick={e => { e.preventDefault(); setIsFavorited(!isFavorited); }}
          style={{
            background: '#f8f9ff', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '16px', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e6eeff'}
          onMouseLeave={e => e.currentTarget.style.background = '#f8f9ff'}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <span style={{ background: st.bg, color: st.color, fontSize: '11px', padding: '2px 8px', borderRadius: '99px', fontWeight: '600' }}>
          {st.label}
        </span>
        {isUrgent && (
          <span style={{ background: '#fef2f2', color: '#991b1b', fontSize: '11px', padding: '2px 8px', borderRadius: '99px', fontWeight: '600' }}>
            ⚡ Urgent
          </span>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '12px',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {project.description}
      </p>

      {/* Skills */}
      {project.skillsRequired?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {project.skillsRequired.slice(0, 5).map(skill => (
            <span key={skill} style={{
              background: '#e6eeff', color: '#142175',
              fontSize: '12px', padding: '3px 10px',
              borderRadius: '99px', fontWeight: '500',
            }}>
              {skill}
            </span>
          ))}
          {project.skillsRequired.length > 5 && (
            <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '12px', padding: '3px 10px', borderRadius: '99px' }}>
              +{project.skillsRequired.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer: budget + bids + date */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid #f1f5f9', paddingTop: '12px',
        flexWrap: 'wrap', gap: '8px',
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '15px' }}>💰</span>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#006b5c' }}>{budget}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '13px' }}>
            <span>💼</span>
            <span>{project._count?.bids ?? 0} bids</span>
          </div>
          {project.client?.firstName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '13px' }}>
              <span>👤</span>
              <span>{project.client.firstName}</span>
            </div>
          )}
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8', flexShrink: 0 }}>{daysAgo}</span>
      </div>
    </div>
  );
};

export default SearchResultCard;
