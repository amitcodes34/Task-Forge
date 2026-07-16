// =============================================================================
// src/pages/AdminDashboardPage.jsx – Admin Platform Monitor
// =============================================================================

import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ACTION_COLORS = {
  USER_LOGIN: { bg: 'var(--color-primary-glow)', color: 'var(--color-primary)', icon: '🔑' },
  USER_REGISTER: { bg: 'rgba(5,150,105,0.10)', color: 'var(--color-success)', icon: '✨' },
  USER_BANNED: { bg: 'rgba(186,26,26,0.10)', color: 'var(--color-danger)', icon: '🚫' },
  USER_UNBANNED: { bg: 'rgba(5,150,105,0.10)', color: 'var(--color-success)', icon: '✅' },
  BID_ACCEPTED: { bg: 'var(--color-accent-glow)', color: 'var(--color-accent)', icon: '🏆' },
  BID_PLACED: { bg: 'var(--color-primary-glow)', color: 'var(--color-primary)', icon: '💼' },
  BID_WITHDRAWN: { bg: 'rgba(100,116,139,0.10)', color: 'var(--color-text-muted)', icon: '↩️' },
  PROJECT_CREATED: { bg: 'var(--color-primary-glow)', color: 'var(--color-primary)', icon: '📋' },
  PROJECT_DELIVERED: { bg: 'var(--color-accent-glow)', color: 'var(--color-accent)', icon: '📦' },
  PROJECT_COMPLETED: { bg: 'rgba(5,150,105,0.10)', color: 'var(--color-success)', icon: '✅' },
  PROJECT_DELETED: { bg: 'rgba(186,26,26,0.10)', color: 'var(--color-danger)', icon: '🗑️' },
  USER_PASSWORD_RESET: { bg: 'rgba(186,26,26,0.10)', color: 'var(--color-danger)', icon: '🔐' },
};

const getActionStyle = (action) =>
  ACTION_COLORS[action] || { bg: 'rgba(100,116,139,0.1)', color: 'var(--color-text-muted)', icon: '📝' };

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

const STATUS_COLORS = {
  OPEN: 'var(--color-primary)',
  IN_PROGRESS: 'var(--color-accent)',
  DELIVERED: 'var(--color-warning)',
  COMPLETED: 'var(--color-success)',
};
const ROLE_COLORS = { CLIENT: 'var(--color-primary)', FREELANCER: 'var(--color-accent)', ADMIN: 'var(--color-danger)' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Always load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const { data } = await adminAPI.getStats();
        setStats(data.data.stats);
      } catch {
        setError('Failed to load platform stats.');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data.data.users);
      setPagination(data.meta);
    } catch {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getProjects();
      setProjects(data.data.projects);
      setPagination(data.meta);
    } catch {
      setError('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAuditLogs({ limit: 50 });
      setAuditLogs(data.data.logs);
      setPagination(data.meta);
    } catch {
      setError('Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'projects') fetchProjects();
    else if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const handleBan = async (user) => {
    const action = user.isBanned ? 'unban' : 'ban';
    if (!window.confirm(`${action} ${user.email}?`)) return;
    setError('');
    setMessage('');
    try {
      if (user.isBanned) await adminAPI.unbanUser(user.id);
      else await adminAPI.banUser(user.id);
      setMessage(`User ${action}ned successfully.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const STAT_CARDS = stats
    ? [
        { icon: '👥', label: 'Total Users', value: stats.totalUsers, cls: 'purple' },
        { icon: '💼', label: 'Freelancers', value: stats.totalFreelancers, cls: 'green' },
        { icon: '🏢', label: 'Clients', value: stats.totalClients, cls: 'orange' },
        { icon: '📋', label: 'Active Projects', value: stats.activeProjects, cls: 'purple' },
        { icon: '✅', label: 'Completed', value: stats.completedProjects, cls: 'green' },
        { icon: '🎯', label: 'Bids Today', value: stats.bidsToday, cls: 'orange' },
        {
          icon: '💰',
          label: 'Revenue Estimate',
          value: `$${stats.revenueEstimate?.toLocaleString()}`,
          cls: 'green',
        },
        { icon: '📊', label: 'Total Bids', value: stats.totalBids, cls: 'purple' },
      ]
    : [];

  const TABS = [
    { id: 'stats', label: '📊 Overview' },
    { id: 'users', label: '👤 Users' },
    { id: 'projects', label: '📋 Projects' },
    { id: 'audit', label: '🔍 Audit Log' },
  ];

  return (
    <div className="page-layout">
      <div className="page-header">
        <h1 className="page-header__title">🛡️ Admin Dashboard</h1>
        <p className="page-header__subtitle">
          Platform overview, user management, and audit trail.
        </p>
      </div>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-3" style={{ marginBottom: '32px', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn--primary' : 'btn--secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats Overview                                                       */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'stats' && (
        <div>
          {statsLoading ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '20px',
                  marginBottom: '40px',
                }}
              >
                {STAT_CARDS.map((s) => (
                  <div key={s.label} className="stat-card">
                    <div className={`stat-card__icon stat-card__icon--${s.cls}`}>{s.icon}</div>
                    <div>
                      <div className="stat-card__value">{s.value}</div>
                      <div className="stat-card__label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick insight box */}
              <div
                className="card"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-primary-glow)',
                }}
              >
                <h2
                  style={{ fontWeight: 700, marginBottom: '16px', fontSize: 'var(--font-size-lg)' }}
                >
                  📈 Platform Health
                </h2>
                <div className="grid-3" style={{ gap: '16px' }}>
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      Freelancer / Client Ratio
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '20px',
                        color: 'var(--color-primary-light)',
                      }}
                    >
                      {stats?.totalClients > 0
                        ? (stats.totalFreelancers / stats.totalClients).toFixed(1)
                        : '—'}
                      :1
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      Project Completion Rate
                    </div>
                    <div
                      style={{ fontWeight: 700, fontSize: '20px', color: 'var(--color-success)' }}
                    >
                      {stats?.activeProjects + stats?.completedProjects > 0
                        ? `${Math.round((stats.completedProjects / (stats.activeProjects + stats.completedProjects)) * 100)}%`
                        : '—'}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      Avg Revenue per Project
                    </div>
                    <div
                      style={{ fontWeight: 700, fontSize: '20px', color: 'var(--color-accent)' }}
                    >
                      {stats?.completedProjects > 0
                        ? `$${Math.round(stats.revenueEstimate / stats.completedProjects).toLocaleString()}`
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Users Table                                                          */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'users' &&
        (loading ? (
          <div className="spinner-wrapper">
            <div className="spinner" />
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Projects</th>
                  <th>Bids</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {u.firstName} {u.lastName}
                      {u.deletedAt && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '10px',
                            color: 'var(--color-danger)',
                          }}
                        >
                          DELETED
                        </span>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        style={{
                          color: ROLE_COLORS[u.role],
                          fontWeight: 700,
                          fontSize: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u._count?.projects ?? 0}</td>
                    <td>{u._count?.bids ?? 0}</td>
                    <td>{u.isEmailVerified ? '✅' : '❌'}</td>
                    <td>
                      <span className={`badge badge--${u.isBanned ? 'rejected' : 'accepted'}`}>
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'ADMIN' && (
                        <button
                          className={`btn btn--sm ${u.isBanned ? 'btn--success' : 'btn--danger'}`}
                          onClick={() => handleBan(u)}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* ------------------------------------------------------------------ */}
      {/* Projects Table                                                       */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'projects' &&
        (loading ? (
          <div className="spinner-wrapper">
            <div className="spinner" />
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Bids</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} style={{ opacity: p.deletedAt ? 0.5 : 1 }}>
                    <td
                      style={{
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        maxWidth: '280px',
                      }}
                    >
                      {p.title}
                      {p.deletedAt && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '10px',
                            color: 'var(--color-danger)',
                          }}
                        >
                          DELETED
                        </span>
                      )}
                    </td>
                    <td>
                      {p.client?.firstName} {p.client?.lastName}
                    </td>
                    <td style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                      ${parseFloat(p.budget).toLocaleString()}
                    </td>
                    <td>
                      <span
                        style={{
                          color: STATUS_COLORS[p.status] || 'var(--color-text-muted)',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        {p.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{p._count?.bids ?? 0}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* ------------------------------------------------------------------ */}
      {/* Audit Log                                                            */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'audit' &&
        (loading ? (
          <div className="spinner-wrapper">
            <div className="spinner" />
          </div>
        ) : (
          <div className="flex-col gap-3">
            {auditLogs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3 className="empty-state__title">No audit events yet</h3>
                <p className="empty-state__desc">
                  Events will appear here as users interact with the platform.
                </p>
              </div>
            ) : (
              auditLogs.map((log) => {
                const style = getActionStyle(log.action);
                return (
                  <div
                    key={log.id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        flexShrink: 0,
                        background: style.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}
                    >
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="flex justify-between items-center"
                        style={{ flexWrap: 'wrap', gap: '4px' }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '13px',
                            color: style.color,
                            padding: '2px 8px',
                            background: style.bg,
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {timeAgo(log.createdAt)}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '13px',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {log.actor ? (
                          <span>
                            <strong style={{ color: 'var(--color-text-primary)' }}>
                              {log.actor.firstName} {log.actor.lastName}
                            </strong>
                            <span
                              style={{
                                color: ROLE_COLORS[log.actor.role],
                                fontWeight: 600,
                                fontSize: '11px',
                                marginLeft: '6px',
                              }}
                            >
                              {log.actor.role}
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>System</span>
                        )}
                        {log.resourceType && (
                          <span style={{ marginLeft: '8px', color: 'var(--color-text-muted)' }}>
                            → {log.resourceType}
                            {log.resourceId && (
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '11px',
                                  marginLeft: '4px',
                                  color: 'var(--color-text-muted)',
                                }}
                              >
                                {log.resourceId.slice(0, 8)}…
                              </span>
                            )}
                          </span>
                        )}
                        {log.ip && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '11px',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            from {log.ip}
                          </span>
                        )}
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div
                          style={{
                            marginTop: '6px',
                            padding: '6px 10px',
                            background: 'var(--color-bg-surface)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: 'var(--color-text-muted)',
                            maxWidth: '500px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ))}
    </div>
  );
};

export default AdminDashboardPage;
