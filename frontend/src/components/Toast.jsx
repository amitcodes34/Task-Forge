// =============================================================================
// src/components/Toast.jsx – Lightweight Toast Notification Component
// =============================================================================
//
// WHAT THIS DOES:
// Shows a small popup notification at the bottom-right corner of the screen
// when a new bid arrives via WebSocket. It auto-dismisses after 4 seconds
// with a smooth slide-up + fade-out animation.
//
// HOW TO USE:
//   <Toast message="🔔 A new bid just arrived!" onClose={() => setToast('')} />
//   (Only renders when `message` is truthy)
// =============================================================================

import { useEffect, useState } from 'react';

const Toast = ({ message, onClose, type = 'info' }) => {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation shortly after mount
  useEffect(() => {
    if (!message) return;
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 350); // Wait for exit animation to finish
    }, 4000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [message, onClose]);

  if (!message) return null;

  const STYLES = {
    info: { bg: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'var(--color-primary-light)' },
    success: { bg: 'var(--color-success)', color: 'var(--color-text-inverse)', border: 'var(--color-success)' },
    error: { bg: 'var(--color-danger)', color: 'var(--color-text-inverse)', border: 'var(--color-danger)' },
    bid: { bg: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', border: 'var(--color-accent)' },
  };

  const s = STYLES[type] || STYLES.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.border}`,
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        fontSize: '14px',
        fontWeight: 700,
        maxWidth: '360px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        // Animate in/out
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={() => {
        setVisible(false);
        setTimeout(onClose, 350);
      }}
    >
      {/* Pulsing dot indicator */}
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: type === 'bid' ? 'var(--color-accent)' : 'var(--color-text-inverse)',
          flexShrink: 0,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />

      <span style={{ flex: 1 }}>{message}</span>

      {/* Close button */}
      <button
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          opacity: 0.6,
          fontSize: '16px',
          padding: '0 0 0 4px',
          lineHeight: 1,
          fontFamily: 'inherit',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
          setTimeout(onClose, 350);
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
