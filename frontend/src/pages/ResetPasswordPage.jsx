// =============================================================================
// src/pages/ResetPasswordPage.jsx
// =============================================================================

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Trim whitespace/newlines that may appear when copying from terminal
  const token = searchParams.get('token')?.trim();

  // Warn immediately if no token in URL
  useEffect(() => {
    if (!token) {
      setError('No reset token found in the URL. Please use the exact link from your terminal.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('No reset token found. Please use the link from your backend terminal.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">⚡ TaskForge</div>

        {!success ? (
          <>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">Enter your new password below.</p>

            {/* Dev hint */}
            {token && (
              <div className="alert alert--info" style={{ fontSize: '12px', marginBottom: '16px' }}>
                🔑 Token detected from URL ✅
              </div>
            )}

            {!token && (
              <div
                className="alert alert--warning"
                style={{ fontSize: '12px', marginBottom: '16px' }}
              >
                ⚠️ No token in URL. Make sure you copied the <strong>full link</strong> from your
                backend terminal.
              </div>
            )}

            {error && <div className="alert alert--error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                className={`btn btn--primary btn--full btn--lg ${loading ? 'btn--loading' : ''}`}
                disabled={loading || !token}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '60px', margin: '16px 0' }}>🔐</div>
            <h1 className="auth-title">Password Reset!</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              Your password has been updated successfully. Redirecting to login...
            </p>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
