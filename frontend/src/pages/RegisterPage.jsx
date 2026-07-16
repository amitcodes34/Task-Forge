// =============================================================================
// src/pages/RegisterPage.jsx
// =============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CLIENT',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      setSuccess(data.message || 'Registration successful! Please check your email.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors?.length) {
        setError(errData.errors.map((e) => e.message).join(' '));
      } else {
        setError(errData?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">⚡ TaskForge</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the marketplace today</p>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">I want to...</label>
            <div className="role-selector">
              {[
                {
                  value: 'CLIENT',
                  icon: '💼',
                  name: 'Hire Talent',
                  desc: 'Post projects & manage freelancers',
                },
                {
                  value: 'FREELANCER',
                  icon: '🎨',
                  name: 'Find Work',
                  desc: 'Browse projects & place bids',
                },
              ].map((role) => (
                <label key={role.value} className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={form.role === role.value}
                    onChange={handleChange}
                  />
                  <span className="role-option__label">
                    <span className="role-option__icon">{role.icon}</span>
                    <span className="role-option__name">{role.name}</span>
                    <span className="role-option__desc">{role.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Name Row */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                className="form-input"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="form-input"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Min. 8 chars with uppercase & number"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span className="form-hint">Must contain uppercase, lowercase, and a number.</span>
          </div>

          <button
            type="submit"
            className={`btn btn--primary btn--full btn--lg ${loading ? 'btn--loading' : ''}`}
            disabled={loading || !!success}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
