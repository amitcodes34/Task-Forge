// =============================================================================
// src/App.jsx – Application Root with React Router
// =============================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNavBar from './components/BottomNavBar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CreateProjectPage from './pages/CreateProjectPage';
import DashboardPage from './pages/DashboardPage';
import WorkroomPage from './pages/WorkroomPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Public Project Routes */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          {/* Protected: Any Authenticated User */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workroom"
            element={
              <ProtectedRoute>
                <WorkroomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected: CLIENT only */}
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <CreateProjectPage />
              </ProtectedRoute>
            }
          />

          {/* Protected: ADMIN only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="page-layout" style={{ textAlign: 'center', paddingTop: '80px' }}>
                <div
                  style={{
                    fontSize: '80px',
                    marginBottom: '16px',
                    color: 'var(--color-primary)',
                    fontWeight: 900,
                    letterSpacing: '-4px',
                  }}
                >
                  404
                </div>
                <h1
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 900,
                    marginBottom: '8px',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Page Not Found
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                  The page you're looking for doesn't exist.
                </p>
                <a href="/" className="btn btn--primary">
                  Go to Home
                </a>
              </div>
            }
          />
        </Routes>
        <BottomNavBar />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
