// =============================================================================
// src/pages/LandingPage.jsx – TaskForge Hero Landing Page
// Corporate / Modern Design System
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Animated Counter Hook
// ---------------------------------------------------------------------------
const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const AnimatedCounter = ({ target, suffix = '', prefix = '', start }) => {
  const count = useCounter(target, 2200, start);
  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Features data
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    icon: '🛡️',
    title: 'Defense-in-Depth Auth',
    desc: 'JWT access + refresh tokens, bcrypt-12 hashing, email verification, rate-limited endpoints, and full audit logging.',
    accent: 'var(--color-primary)',
    bg: 'var(--color-bg-overlay)',
  },
  {
    icon: '⚡',
    title: 'Smart Bid Matching',
    desc: 'Skill-based project matching ranks opportunities based on your profile tags. Find the right work instantly.',
    accent: 'var(--color-accent)',
    bg: '#e6fffa',
  },
  {
    icon: '📦',
    title: 'End-to-End Workflow',
    desc: 'From posting to bid acceptance, delivery, and review — a complete state machine enforced at every step.',
    accent: 'var(--color-primary)',
    bg: 'var(--color-bg-overlay)',
  },
  {
    icon: '🔍',
    title: 'Full Audit Trail',
    desc: 'Every critical action is logged: logins, bans, bid acceptances, project transitions. Full transparency for admins.',
    accent: 'var(--color-accent)',
    bg: '#e6fffa',
  },
  {
    icon: '📧',
    title: 'Smart Notifications',
    desc: 'Freelancers get instant bid-accepted emails. Clients receive debounced new-bid alerts (max 1/hour per project).',
    accent: 'var(--color-primary)',
    bg: 'var(--color-bg-overlay)',
  },
  {
    icon: '⭐',
    title: 'Verified Reviews',
    desc: 'Reviews are locked to verified project completions — one per engagement, per party. No fake ratings.',
    accent: 'var(--color-accent)',
    bg: '#e6fffa',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Post a Project',
    desc: 'Clients describe their project, set a budget, deadline, and required skills.',
    role: 'CLIENT',
    color: 'var(--color-primary)',
  },
  {
    step: '02',
    title: 'Submit Proposals',
    desc: 'Skilled freelancers submit competitive proposals with pricing and timelines.',
    role: 'FREELANCER',
    color: 'var(--color-accent)',
  },
  {
    step: '03',
    title: 'AI Bid Scoring',
    desc: 'Our Gemini AI instantly scores and ranks all bids based on relevance, quality, and freelancer skills.',
    role: 'SYSTEM',
    color: '#8B5CF6',
  },
  {
    step: '04',
    title: 'Escrow & Start',
    desc: 'Client picks the best bid and securely pays via Stripe. Funds are held in escrow while work begins.',
    role: 'CLIENT',
    color: 'var(--color-primary)',
  },
  {
    step: '05',
    title: 'Deliver & Complete',
    desc: 'Freelancer delivers work. Client reviews and confirms completion to release escrow funds.',
    role: 'BOTH',
    color: 'var(--color-accent)',
  },
  {
    step: '06',
    title: 'Leave Reviews',
    desc: 'Both parties review each other. Ratings build reputation on the platform.',
    role: 'BOTH',
    color: 'var(--color-success)',
  },
];

// ---------------------------------------------------------------------------
// Landing Page Component
// ---------------------------------------------------------------------------
const LandingPage = () => {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ overflowX: 'hidden', background: 'var(--color-bg-base)' }}>
      {/* ------------------------------------------------------------------ */}
      {/* Hero Section — Corporate Light                                      */}
      {/* ------------------------------------------------------------------ */}
      <section
        style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px',
          position: 'relative',
          background: `
          radial-gradient(ellipse 70% 55% at 50% -5%, rgba(20, 33, 117, 0.05) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 85% 70%, rgba(0, 107, 92, 0.04) 0%, transparent 50%)
        `,
          overflow: 'hidden',
        }}
      >
        {/* Soft decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20, 33, 117, 0.03), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-80px',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 107, 92, 0.03), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '880px', position: 'relative', zIndex: 1 }}>
          {/* Badge — pill style */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '9999px',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-primary)',
              marginBottom: '36px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-sm)',
              animation: 'fadeIn 0.6s ease',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }}
            />
            Scale-Oriented Freelance Platform
          </div>

          {/* Headline — Corporate / Modern */}
          <h1
            style={{
              fontSize: 'clamp(36px, 7vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '28px',
              letterSpacing: '-0.02em',
              animation: 'slideUp 0.7s ease 0.1s both',
              color: 'var(--color-text-primary)',
            }}
          >
            The Marketplace
            <br />
            Built for <span style={{ color: 'var(--color-primary)' }}>High-Performing</span>
            <br />
            <span style={{ color: 'var(--color-accent)' }}>Freelancers & Businesses</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 18px)',
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              margin: '0 auto 52px',
              lineHeight: 1.6,
              fontWeight: 400,
              animation: 'slideUp 0.7s ease 0.2s both',
            }}
          >
            TaskForge connects businesses with elite freelancers through a secure, audited, and fully
            automated workflow — from AI-scored bids to Stripe escrow delivery.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'slideUp 0.7s ease 0.3s both',
            }}
          >
            <Link to="/register" className="btn btn--primary btn--lg">
              Get Started Free &rarr;
            </Link>
            <Link to="/projects" className="btn btn--secondary btn--lg">
              Browse Projects
            </Link>
          </div>

          {/* Trust badges */}
          <div
            style={{
              marginTop: '64px',
              display: 'flex',
              gap: '36px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeIn 1s ease 0.5s both',
            }}
          >
            {[
              { icon: '🔐', label: 'Stripe Escrow Security' },
              { icon: '🤖', label: 'Gemini AI Bid Scoring' },
              { icon: '⚡', label: 'Instant WebSockets' },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <span>{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Stats Section — Light Mode                                          */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={statsRef}
        style={{
          padding: '64px 24px',
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              textAlign: 'center',
            }}
          >
            {[
              { target: 1200, suffix: '+', label: 'Projects Posted', color: 'var(--color-primary)' },
              { target: 4800, suffix: '+', label: 'Freelancers Registered', color: 'var(--color-accent)' },
              { target: 92, suffix: '%', label: 'Client Satisfaction', color: 'var(--color-success)' },
              {
                target: 2300000,
                prefix: '$',
                suffix: '',
                label: 'Escrow Volume',
                color: 'var(--color-primary)',
              },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: '16px 24px',
                  borderRight: i < 3 ? '1px solid var(--color-divider)' : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: s.color,
                    marginBottom: '8px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  <AnimatedCounter
                    target={s.target}
                    suffix={s.suffix}
                    prefix={s.prefix || ''}
                    start={statsVisible}
                  />
                </div>
                <div
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Features Grid — Corporate Cards                                    */}
      {/* ------------------------------------------------------------------ */}
      <section style={{ padding: '100px 24px', background: 'var(--color-bg-base)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'var(--color-accent-glow)',
              }}
            >
              Enterprise Grade
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
              }}
            >
              Built for Reliability,
              <br />
              <span style={{ color: 'var(--color-primary)' }}>Engineered for Scale</span>
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '16px',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Every design decision — from robust Stripe escrow to Gemini AI bid scoring — reflects modern corporate engineering standards.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card"
                style={{
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: f.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    marginBottom: '20px',
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: '18px',
                    marginBottom: '8px',
                    color: 'var(--color-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How It Works — Corporate Linear Steps                              */}
      {/* ------------------------------------------------------------------ */}
      <section
        style={{
          padding: '100px 24px',
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'var(--color-primary-glow)',
              }}
            >
              How It Works
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                color: 'var(--color-text-primary)',
              }}
            >
              6-Step Workflow
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', marginTop: '12px', lineHeight: 1.6 }}>
              Server-side state machine enforcement at every transition.
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                style={{
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'flex-start',
                }}
              >
                {/* Step number + connector */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--color-bg-elevated)',
                      border: `2px solid ${step.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '16px',
                      color: step.color,
                      flexShrink: 0,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {step.step}
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div
                      style={{
                        width: '2px',
                        flex: '1',
                        minHeight: '40px',
                        background: 'var(--color-divider)',
                        margin: '8px 0',
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingBottom: '48px', paddingTop: '10px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <h3 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text-primary)' }}>
                      {step.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 10px',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: `1px solid ${step.color}`,
                        color: step.color,
                        background: 'var(--color-bg-base)',
                      }}
                    >
                      {step.role === 'BOTH' ? 'Client + Freelancer' : step.role}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA Section — Indigo Corporate Block                               */}
      {/* ------------------------------------------------------------------ */}
      <section
        style={{
          padding: '100px 24px',
          textAlign: 'center',
          background: 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}
          >
            Ready to Accelerate
            <br />
            Your Projects?
          </h2>
          <p
            style={{
              color: 'var(--color-primary-fixed-dim, #bcc3ff)',
              fontSize: '18px',
              marginBottom: '44px',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Join TaskForge today as a client to securely escrow projects, or as a freelancer to unlock AI-matched opportunities.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              className="btn btn--primary btn--lg"
              style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="btn btn--secondary btn--lg"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                            */}
      {/* ------------------------------------------------------------------ */}
      <footer
        style={{
          padding: '40px 24px',
          background: 'var(--color-bg-base)',
          textAlign: 'center',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          &copy; {new Date().getFullYear()} TaskForge. Built for Scale.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
