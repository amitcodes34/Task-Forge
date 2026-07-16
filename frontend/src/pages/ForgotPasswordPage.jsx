// =============================================================================
// src/pages/ForgotPasswordPage.jsx
// =============================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ TaskForge</div>
        {!submitted ? (
          <>
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
            {error && <div className="alert alert--error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className={`btn btn--primary btn--full btn--lg ${loading ? 'btn--loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '60px', margin: '16px 0' }}>📧</div>
            <h1 className="auth-title">Check Your Email</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              If an account with <strong>{email}</strong> exists, a password reset link has been
              sent.
            </p>

            {/* Dev mode hint */}
            <div className="alert alert--info" style={{ textAlign: 'left', marginTop: '16px' }}>
              <strong>🛠️ Development Mode:</strong>
              <br />
              No real email is sent. Open your <strong>Backend Terminal</strong> (where{' '}
              <code>npm run dev</code> is running) and look for a message like:
              <pre
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px',
                  borderRadius: '6px',
                  marginTop: '8px',
                  fontSize: '11px',
                  overflowX: 'auto',
                  color: '#00D4AA',
                }}
              >
                📧 DEV EMAIL INTERCEPTED – PASSWORD RESET{'\n'}
                Link: http://localhost:5173/reset-password?token=...
              </pre>
              Copy that link and paste it into your browser.
            </div>
          </div>
        )}
        <div className="auth-footer">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
