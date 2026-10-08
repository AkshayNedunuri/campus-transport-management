import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import FindShuttle from './pages/student/FindShuttle';
import RoutesPage from './pages/student/RoutesPage';
import StopsPage from './pages/student/StopsPage';
import LiveTrackingPage from './pages/student/LiveTrackingPage';
import MyTripsPage from './pages/student/MyTripsPage';
import FavoritesPage from './pages/student/FavoritesPage';
import NotificationsPage from './pages/student/NotificationsPage';
import ReportIssuePage from './pages/student/ReportIssuePage';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ManageUsers from './pages/admin/ManageUsers';
import ManageShuttles from './pages/admin/ManageShuttles';
import ManageComplaints from './pages/admin/ManageComplaints';
import AdminNotifications from './pages/admin/AdminNotifications';
import ProfilePage from './pages/common/ProfilePage';

import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'driver') return <Navigate to="/driver/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

// Root redirect based on user role
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'driver') return <Navigate to="/driver/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/find" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}>
          <FindShuttle />
        </ProtectedRoute>
      } />
      <Route path="/student/routes" element={
        <ProtectedRoute allowedRoles={['student', 'admin', 'driver']}>
          <RoutesPage />
        </ProtectedRoute>
      } />
      <Route path="/student/stops" element={
        <ProtectedRoute allowedRoles={['student', 'admin', 'driver']}>
          <StopsPage />
        </ProtectedRoute>
      } />
      <Route path="/student/tracking" element={
        <ProtectedRoute allowedRoles={['student', 'admin', 'driver']}>
          <LiveTrackingPage />
        </ProtectedRoute>
      } />
      <Route path="/student/trips" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}>
          <MyTripsPage />
        </ProtectedRoute>
      } />
      <Route path="/student/favorites" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}>
          <FavoritesPage />
        </ProtectedRoute>
      } />
      <Route path="/student/notifications" element={
        <ProtectedRoute allowedRoles={['student', 'admin', 'driver']}>
          <NotificationsPage />
        </ProtectedRoute>
      } />
      <Route path="/student/report" element={
        <ProtectedRoute allowedRoles={['student', 'admin', 'driver']}>
          <ReportIssuePage />
        </ProtectedRoute>
      } />

      {/* Driver Routes */}
      <Route path="/driver/dashboard" element={
        <ProtectedRoute allowedRoles={['driver', 'admin']}>
          <DriverDashboard />
        </ProtectedRoute>
      } />
      <Route path="/driver/trips" element={
        <ProtectedRoute allowedRoles={['driver', 'admin']}>
          <MyTripsPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AnalyticsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ManageUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/shuttles" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ManageShuttles />
        </ProtectedRoute>
      } />
      <Route path="/admin/routes" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <RoutesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/stops" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <StopsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/trips" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MyTripsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/complaints" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ManageComplaints />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminNotifications />
        </ProtectedRoute>
      } />

      {/* Profile (accessible by all authenticated roles) */}
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['student', 'driver', 'admin']}>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
