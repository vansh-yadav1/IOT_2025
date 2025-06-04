// Main application component for the Hospital Management System.
// This file sets up the routing and layout for the application, integrating IoT-enabled smartwatch data for real-time health monitoring.

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { theme } from './theme';
import DoctorMap from './components/DoctorMap';
import FindDoctor from './pages/FindDoctor';

// Layout
import AppLayout from './components/layout/AppLayout';
import PrivateRoute from './components/common/PrivateRoute';

// Public pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import LandingPage from './pages/public/LandingPage';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Health Metrics
import { HealthDashboard, MetricDetail, MetricEntry, WearableHealthDashboard } from './pages/health-metrics';
import MedicationsPage from './pages/health-metrics/MedicationsPage';

// Profile
import UserProfile from './pages/profile/UserProfile';
import MedicalProfile from './pages/profile/MedicalProfile';
import NotificationsPage from './pages/profile/NotificationsPage';

// Resources
import { ResourcesHome, ArticleView as ResourceArticleView } from './pages/resources';

// Knowledge Base
import { KnowledgeBase, ArticleView as KnowledgeBaseArticleView } from './pages/knowledge-base';

// Telemedicine
import { TelemedicineSession, TelemedicineLanding } from './pages/telemedicine';

// Messaging
import MessagingPage from './pages/messaging/MessagingPage';

// Patient Portal
import PatientPortal from './pages/patients/PatientPortal';
import PatientDetails from './pages/patients/PatientDetails';

// Test Health
import TestHealth from './pages/TestHealth';

// Reports
import ReportsList from './pages/reports/ReportsList';

// Appointments
import { NewAppointment, DoctorAppointments } from './pages/appointments';
import PatientAppointments from './pages/appointments/PatientAppointments';

// Placeholder components for missing features
const Inbox = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Messaging Inbox</Typography>
    <Typography variant="body1">This feature is under development.</Typography>
  </Box>
);

const AccountSettings = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Account Settings</Typography>
    <Typography variant="body1">This feature is under development.</Typography>
  </Box>
);

const VideoSession = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Telemedicine Video Session</Typography>
    <Typography variant="body1">This feature is under development.</Typography>
  </Box>
);

const UserManagement = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">User Management</Typography>
    <Typography variant="body1">This admin feature is under development.</Typography>
  </Box>
);

const RoleManagement = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Role Management</Typography>
    <Typography variant="body1">This admin feature is under development.</Typography>
  </Box>
);

// Configure query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Move all route logic into AppRoutes so useAuth is only called inside AuthProvider
const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* Protected routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard/doctor" element={<PrivateRoute roles={['DOCTOR']}><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard/patient" element={<PrivateRoute roles={['PATIENT']}><Dashboard /></PrivateRoute>} />
        {/* Add Reports route */}
        <Route path="/reports" element={<PrivateRoute><ReportsList /></PrivateRoute>} />
        {/* Health Metrics */}
        <Route path="/health-metrics" element={<PrivateRoute roles={['PATIENT']}><HealthDashboard /></PrivateRoute>} />
        <Route path="/health-metrics/:metricId" element={<PrivateRoute roles={['PATIENT']}><MetricDetail /></PrivateRoute>} />
        <Route path="/health-metrics/:metricId/add" element={<PrivateRoute roles={['PATIENT']}><MetricEntry /></PrivateRoute>} />
        <Route path="/health-metrics/:metricId/edit/:readingId" element={<PrivateRoute roles={['PATIENT']}><MetricEntry /></PrivateRoute>} />
        <Route path="/wearable-data" element={<PrivateRoute roles={['PATIENT']}><WearableHealthDashboard /></PrivateRoute>} />
        <Route path="/wearable-data/:userId" element={<PrivateRoute roles={['PATIENT']}><WearableHealthDashboard /></PrivateRoute>} />
        <Route path="/health-metrics/medications" element={<PrivateRoute roles={['PATIENT']}><MedicationsPage /></PrivateRoute>} />
        {/* Messaging */}
        <Route path="/messages" element={<PrivateRoute><MessagingPage /></PrivateRoute>} />
        <Route path="/messages/doctor" element={<PrivateRoute roles={['DOCTOR']}><MessagingPage /></PrivateRoute>} />
        <Route path="/messages/patient" element={<PrivateRoute roles={['PATIENT']}><MessagingPage /></PrivateRoute>} />
        {/* Profile */}
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/profile/doctor" element={<PrivateRoute roles={['DOCTOR']}><UserProfile /></PrivateRoute>} />
        <Route path="/profile/patient" element={<PrivateRoute roles={['PATIENT']}><UserProfile /></PrivateRoute>} />
        <Route path="/profile/medical" element={<PrivateRoute roles={['PATIENT']}><MedicalProfile /></PrivateRoute>} />
        <Route path="/profile/settings" element={<PrivateRoute><AccountSettings /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        {/* Telemedicine */}
        <Route path="/telemedicine" element={<PrivateRoute><TelemedicineLanding /></PrivateRoute>} />
        <Route path="/telemedicine/doctor" element={<PrivateRoute roles={['DOCTOR']}><TelemedicineLanding /></PrivateRoute>} />
        <Route path="/telemedicine/patient" element={<PrivateRoute roles={['PATIENT']}><TelemedicineLanding /></PrivateRoute>} />
        <Route path="/telemedicine/:appointmentId" element={<PrivateRoute><TelemedicineSession /></PrivateRoute>} />
        {/* Resources */}
        <Route path="/resources" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
        <Route path="/resources/doctor" element={<PrivateRoute roles={['DOCTOR']}><KnowledgeBase /></PrivateRoute>} />
        <Route path="/resources/patient" element={<PrivateRoute roles={['PATIENT']}><KnowledgeBase /></PrivateRoute>} />
        <Route path="/resources/:id" element={<PrivateRoute><KnowledgeBaseArticleView /></PrivateRoute>} />
        {/* Knowledge Base */}
        <Route path="/knowledge-base" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
        <Route path="/knowledge-base/article/:id" element={<PrivateRoute><KnowledgeBaseArticleView /></PrivateRoute>} />
        {/* Admin routes */}
        <Route path="/admin/users" element={<PrivateRoute roles={['ADMIN']}><UserManagement /></PrivateRoute>} />
        <Route path="/admin/roles" element={<PrivateRoute roles={['ADMIN']}><RoleManagement /></PrivateRoute>} />
        {/* Patient Portal for doctors */}
        <Route path="/patients" element={<PrivateRoute roles={['DOCTOR']}><PatientPortal /></PrivateRoute>} />
        <Route path="/patients/doctor" element={<PrivateRoute roles={['DOCTOR']}><PatientPortal /></PrivateRoute>} />
        <Route path="/patients/patient" element={<PrivateRoute roles={['PATIENT']}><PatientPortal /></PrivateRoute>} />
        <Route path="/patients/:id" element={<PrivateRoute roles={['DOCTOR']}><PatientDetails /></PrivateRoute>} />
        {/* Doctor Search for doctors */}
        {/* <Route path="/doctors/search" element={<PrivateRoute roles={['DOCTOR']}><DoctorSearch /></PrivateRoute>} /> */}
        {/* Appointments */}
        <Route path="/appointments/new" element={<PrivateRoute roles={['PATIENT', 'DOCTOR']}><NewAppointment /></PrivateRoute>} />
        <Route path="/appointments/doctor" element={<PrivateRoute roles={['DOCTOR']}><DoctorAppointments /></PrivateRoute>} />
        {/* Patient-specific routes with '/patient' suffix */}
        <Route path="/dashboard/patient" element={<PrivateRoute roles={['PATIENT']}><Dashboard /></PrivateRoute>} />
        <Route path="/patients/patient" element={<PrivateRoute roles={['PATIENT']}><PatientPortal /></PrivateRoute>} />
        <Route path="/messages/patient" element={<PrivateRoute roles={['PATIENT']}><MessagingPage /></PrivateRoute>} />
        <Route path="/telemedicine/patient" element={<PrivateRoute roles={['PATIENT']}><TelemedicineLanding /></PrivateRoute>} />
        <Route path="/resources/patient" element={<PrivateRoute roles={['PATIENT']}><KnowledgeBase /></PrivateRoute>} />
        <Route path="/profile/patient" element={<PrivateRoute roles={['PATIENT']}><UserProfile /></PrivateRoute>} />
        <Route path="/health-metrics/patient" element={<PrivateRoute roles={['PATIENT']}><HealthDashboard /></PrivateRoute>} />
        <Route path="/reports/patient" element={<PrivateRoute roles={['PATIENT']}><ReportsList /></PrivateRoute>} />
        <Route path="/wearable-data/patient" element={<PrivateRoute roles={['PATIENT']}><WearableHealthDashboard /></PrivateRoute>} />
        <Route path="/appointments/new/patient" element={<PrivateRoute roles={['PATIENT']}><NewAppointment /></PrivateRoute>} />
        <Route path="/appointments/patient" element={<PrivateRoute roles={['PATIENT']}><PatientAppointments /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute roles={['PATIENT']}><PatientAppointments /></PrivateRoute>} />
      </Route>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/map" element={<DoctorMap />} />
      <Route path="/test-health" element={<TestHealth />} />
    </Routes>
  );
};

// App component that renders the main application layout and routes.
// It includes authentication checks and role-based access control, ensuring secure and efficient healthcare delivery.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <AppRoutes />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  </QueryClientProvider>
);

export default App; 