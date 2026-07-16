// =============================================================================
// src/pages/VerifyEmailPage.jsx
// =============================================================================

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }
    authAPI
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Verification failed. The link may have expired.'
        );
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">⚡ TaskForge</div>
        {status === 'verifying' && (
          <>
            <div className="spinner-wrapper">
              <div className="spinner" />
            </div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Verifying your email address...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '60px', margin: '16px 0' }}>✅</div>
            <h1 className="auth-title">Email Verified!</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>{message}</p>
            <Link to="/login" className="btn btn--primary">
              Continue to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '60px', margin: '16px 0' }}>❌</div>
            <h1 className="auth-title">Verification Failed</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>{message}</p>
            <Link to="/register" className="btn btn--secondary">
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
