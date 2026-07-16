// =============================================================================
// src/pages/CreateProjectPage.jsx – Client: Create a New Project
// =============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    skillsRequired: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        budget: Number(form.budget),
        skillsRequired: form.skillsRequired
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      };
      const { data } = await projectsAPI.create(payload);
      navigate(`/projects/${data.data.project.id}`);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors?.length) {
        setError(errData.errors.map((e) => e.message).join(' '));
      } else {
        setError(errData?.message || 'Failed to create project.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">Post a New Project</h1>
        <p className="page-header__subtitle">Describe what you need. Freelancers will bid on it.</p>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Build a React dashboard with charts"
              value={form.title}
              onChange={handleChange}
              required
              minLength={5}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={8}
              placeholder="Describe the project in detail: requirements, goals, expected output, tech stack preferences..."
              value={form.description}
              onChange={handleChange}
              required
              minLength={20}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Budget (USD) *</label>
              <input
                type="number"
                name="budget"
                className="form-input"
                placeholder="e.g. 500"
                value={form.budget}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                name="deadline"
                className="form-input"
                value={form.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills</label>
            <input
              type="text"
              name="skillsRequired"
              className="form-input"
              placeholder="React, Node.js, PostgreSQL (comma-separated)"
              value={form.skillsRequired}
              onChange={handleChange}
            />
            <span className="form-hint">Separate multiple skills with commas.</span>
          </div>

          <div className="flex gap-3" style={{ marginTop: '8px' }}>
            <button
              type="submit"
              className={`btn btn--primary btn--lg ${loading ? 'btn--loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Project'}
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--lg"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
