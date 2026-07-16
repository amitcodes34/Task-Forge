// =============================================================================
// src/components/ProjectCard.jsx – Project Listing Card Component
// Corporate / Modern Design System
// =============================================================================

import { Link } from 'react-router-dom';

const STATUS_MAP = {
  OPEN: { label: 'Open', cls: 'open' },
  IN_PROGRESS: { label: 'In Progress', cls: 'in-progress' },
  DELIVERED: { label: 'Delivered', cls: 'delivered' },
  COMPLETED: { label: 'Completed', cls: 'completed' },
};

const ProjectCard = ({ project }) => {
  const status = STATUS_MAP[project.status] || { label: project.status, cls: 'open' };
  const budget = parseFloat(project.budget).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header row — status badge + budget */}
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <span className={`badge badge--${status.cls}`}>{status.label}</span>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {budget}
        </span>
      </div>

      {/* Title */}
      <h3 className="card__title">{project.title}</h3>

      {/* Description */}
      <p className="card__description" style={{ flex: 1 }}>
        {project.description}
      </p>

      {/* Skill tags */}
      {project.skillsRequired?.length > 0 && (
        <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '16px' }}>
          {project.skillsRequired.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
          {project.skillsRequired.length > 4 && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, alignSelf: 'center' }}>
              +{project.skillsRequired.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Meta info */}
      <div className="card__meta" style={{ marginTop: '16px' }}>
        <span className="card__meta-item">
          👤 {project.client?.firstName} {project.client?.lastName}
        </span>
        <span className="card__meta-item">
          💼 {project._count?.bids ?? 0} bid{project._count?.bids !== 1 ? 's' : ''}
        </span>
        {project.deadline && (
          <span className="card__meta-item">
            📅 {new Date(project.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* CTA */}
      <Link
        to={`/projects/${project.id}`}
        className="btn btn--secondary"
        style={{ marginTop: '20px', alignSelf: 'flex-start' }}
      >
        View Details &rarr;
      </Link>
    </div>
  );
};

export default ProjectCard;
