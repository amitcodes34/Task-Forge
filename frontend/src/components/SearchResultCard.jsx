import { Link } from 'react-router-dom';
import { useState } from 'react';


const SearchResultCard = ({ project }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const budget = parseFloat(project.budget).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const getUrgencyBadge = () => {
    if (!project.deadline) return null;
    const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
      return <span className="badge badge--rejected" style={{ fontSize: '10px', padding: '2px 6px' }}>URGENT</span>;
    }
    return null;
  };

  return (
    <div className="result-card">
      <div className="accent-bar"></div>
      <div className="flex justify-between items-start gap-4">
        <div style={{ flexGrow: 1 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: '4px' }}>
            <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary)', transition: 'color 0.2s ease' }} className="result-card__title">
                {project.title}
              </h4>
            </Link>
            {getUrgencyBadge()}
            {project.status === 'COMPLETED' && <span className="badge badge--accepted" style={{ fontSize: '10px', padding: '2px 6px' }}>COMPLETED</span>}
          </div>
          
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.description}
          </p>
          
          {project.skillsRequired?.length > 0 && (
            <div className="flex flex-wrap gap-2" style={{ marginBottom: '16px' }}>
              {project.skillsRequired.slice(0, 5).map((skill) => (
                <span key={skill} className="skill-tag" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {skill}
                </span>
              ))}
              {project.skillsRequired.length > 5 && (
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                  +{project.skillsRequired.length - 5}
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-6" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: '16px' }}>💰</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{budget}</span>
            </div>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: '16px' }}>💼</span>
              <span>{project._count?.bids ?? 0} Bids</span>
            </div>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: '16px' }}>👤</span>
              <span>{project.client?.firstName}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2" style={{ flexShrink: 0 }}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
            style={{ 
              background: 'var(--color-bg-elevated)', 
              border: 'none',
              borderRadius: '50%', 
              width: '36px', 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: isFavorited ? 'var(--color-danger)' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 'auto' }}>
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;
