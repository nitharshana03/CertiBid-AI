// CertiBid AI - Main Application Entry & Routing Matrix
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { OTPVerification } from './pages/auth/OTPVerification';
import { ResetPassword } from './pages/auth/ResetPassword';

// Dashboards
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { OfficerDashboard } from './pages/dashboards/OfficerDashboard';
import { AuditorDashboard } from './pages/dashboards/AuditorDashboard';
import { VendorDashboard } from './pages/dashboards/VendorDashboard';

// Functional Modules
import { UserManagement } from './pages/users/UserManagement';
import { VendorList } from './pages/vendors/VendorList';
import { VendorDetail } from './pages/vendors/VendorDetail';
import { DocumentVerification } from './pages/documents/DocumentVerification';
import { TenderList } from './pages/tenders/TenderList';
import { TenderCreate } from './pages/tenders/TenderCreate';
import { TenderDetail } from './pages/tenders/TenderDetail';
import { BidSubmission } from './pages/bids/BidSubmission';
import { BidComparison } from './pages/bids/BidComparison';
import { AIRiskDashboard } from './pages/risk/AIRiskDashboard';
import { EscalatedBidsPage } from './pages/risk/EscalatedBidsPage';
import { AwardDecision } from './pages/decision/AwardDecision';
import { PaymentsModule } from './pages/payments/PaymentsModule';
import { ReportsModule } from './pages/reports/ReportsModule';
import { SettingsModule } from './pages/settings/SettingsModule';

// Dynamic Role Dashboard Redirector
function RoleDashboardRouter() {
  const { user } = useAuth();
  const rawRole = String(user?.role || '').toUpperCase().trim();
  const role = rawRole === 'VENDOR' ? 'BIDDER' : rawRole;

  if (role === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />;
  }
  if (role === 'OFFICER') {
    return <Navigate to="/dashboard/officer" replace />;
  }
  if (role === 'BIDDER') {
    return <Navigate to="/dashboard/vendor" replace />;
  }
  return <Navigate to="/dashboard/admin" replace />;
}

// Protected Route Guard with Strict Cross-Role Access Rejection
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const rawRole = String(user.role || '').toUpperCase().trim();
    const userRole = rawRole === 'VENDOR' ? 'BIDDER' : rawRole;

    const normalizedAllowed = allowedRoles.map(r => {
      const u = String(r).toUpperCase().trim();
      return u === 'VENDOR' ? 'BIDDER' : u;
    });

    const isAllowed = normalizedAllowed.includes(userRole);

    if (!isAllowed) {
      if (userRole === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
      if (userRole === 'OFFICER') return <Navigate to="/dashboard/officer" replace />;
      return <Navigate to="/dashboard/vendor" replace />;
    }
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Workspace Application Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              {/* Default Dashboard Redirector */}
              <Route path="/dashboard" element={<RoleDashboardRouter />} />

              {/* Role-Specific Dashboard Routes */}
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/officer"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/auditor"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                    <AuditorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/vendor"
                element={
                  <ProtectedRoute allowedRoles={['BIDDER', 'VENDOR']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Only Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* Admin & Officer Shared Routes (Blocked for Bidder) */}
              <Route
                path="/vendors"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                    <VendorList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendors/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                    <VendorDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/create"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                    <TenderCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/risk-analysis"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                    <AIRiskDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/escalated-bids"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                    <EscalatedBidsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/escalated-bids"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <EscalatedBidsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/officer/escalated-bids"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER']}>
                    <EscalatedBidsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                    <ReportsModule />
                  </ProtectedRoute>
                }
              />

              {/* Officer & Admin Award Decision Route */}
              <Route
                path="/decision"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                    <AwardDecision />
                  </ProtectedRoute>
                }
              />

              {/* Bidder & Shared Bid Routes */}
              <Route
                path="/tenders/:tenderId/register"
                element={
                  <ProtectedRoute allowedRoles={['BIDDER', 'VENDOR']}>
                    <BidSubmission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/:id/register"
                element={
                  <ProtectedRoute allowedRoles={['BIDDER', 'VENDOR']}>
                    <BidSubmission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bids/submit"
                element={
                  <ProtectedRoute allowedRoles={['BIDDER', 'VENDOR']}>
                    <BidSubmission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bids/compare"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'BIDDER', 'VENDOR']}>
                    <BidComparison />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bids/my-bids"
                element={
                  <ProtectedRoute allowedRoles={['BIDDER', 'VENDOR']}>
                    <BidComparison />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bids"
                element={
                  <ProtectedRoute allowedRoles={['BIDDER', 'VENDOR']}>
                    <BidComparison />
                  </ProtectedRoute>
                }
              />

              {/* Officer & Bidder Shared Routes (Blocked for Admin) */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER', 'BIDDER', 'VENDOR']}>
                    <PaymentsModule />
                  </ProtectedRoute>
                }
              />

              {/* Universal Shared Routes */}
              <Route
                path="/tenders"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'BIDDER', 'VENDOR']}>
                    <TenderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'BIDDER', 'VENDOR']}>
                    <TenderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'BIDDER', 'VENDOR']}>
                    <DocumentVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'BIDDER', 'VENDOR']}>
                    <SettingsModule />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

