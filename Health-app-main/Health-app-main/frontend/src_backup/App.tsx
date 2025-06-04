import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { theme } from './theme';
import { queryClient } from './config/queryClient';

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

// Appointments
import AppointmentsList from './pages/appointments/AppointmentsList';
import AppointmentDetails from './pages/appointments/AppointmentDetails';
import NewAppointment from './pages/appointments/NewAppointment';
import AppointmentCalendar from './pages/appointments/AppointmentCalendar';

// Health Metrics
import { HealthDashboard, MetricDetail, MetricEntry } from './pages/health-metrics';

// Profile
import UserProfile from './pages/profile/UserProfile';
import MedicalProfile from './pages/profile/MedicalProfile';

// Reports
import { ReportsList, ReportViewer } from './pages/reports';

// Resources
import { ResourcesHome, ArticleView as ResourceArticleView } from './pages/resources';

// Knowledge Base
import { KnowledgeBase, ArticleView as KnowledgeBaseArticleView } from './pages/knowledge-base';

// Telemedicine
import { TelemedicineSession, TelemedicineLanding } from './pages/telemedicine';

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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  
                  {/* Protected routes */}
                  <Route element={<AppLayout />}>
                    <Route 
                      path="/dashboard" 
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Appointments */}
                    <Route 
                      path="/appointments" 
                      element={
                        <PrivateRoute>
                          <AppointmentsList />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/appointments/calendar" 
                      element={
                        <PrivateRoute>
                          <AppointmentCalendar />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/appointments/new" 
                      element={
                        <PrivateRoute>
                          <NewAppointment />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/appointments/:id" 
                      element={
                        <PrivateRoute>
                          <AppointmentDetails />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Health Metrics */}
                    <Route 
                      path="/health-metrics" 
                      element={
                        <PrivateRoute roles={['PATIENT']}>
                          <HealthDashboard />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/health-metrics/:metricId" 
                      element={
                        <PrivateRoute roles={['PATIENT']}>
                          <MetricDetail />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/health-metrics/:metricId/add" 
                      element={
                        <PrivateRoute roles={['PATIENT']}>
                          <MetricEntry />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/health-metrics/:metricId/edit/:readingId" 
                      element={
                        <PrivateRoute roles={['PATIENT']}>
                          <MetricEntry />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Messaging */}
                    <Route 
                      path="/messages" 
                      element={
                        <PrivateRoute>
                          <Inbox />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Profile */}
                    <Route 
                      path="/profile" 
                      element={
                        <PrivateRoute>
                          <UserProfile />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/profile/medical" 
                      element={
                        <PrivateRoute roles={['PATIENT']}>
                          <MedicalProfile />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/profile/settings" 
                      element={
                        <PrivateRoute>
                          <AccountSettings />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Telemedicine */}
                    <Route 
                      path="/telemedicine" 
                      element={
                        <PrivateRoute>
                          <TelemedicineLanding />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/telemedicine/:appointmentId" 
                      element={
                        <PrivateRoute>
                          <TelemedicineSession />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Reports */}
                    <Route 
                      path="/reports" 
                      element={
                        <PrivateRoute>
                          <ReportsList />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/reports/:reportId" 
                      element={
                        <PrivateRoute>
                          <ReportViewer />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Resources */}
                    <Route 
                      path="/resources" 
                      element={
                        <PrivateRoute>
                          <KnowledgeBase />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/resources/:id" 
                      element={
                        <PrivateRoute>
                          <KnowledgeBaseArticleView />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Knowledge Base */}
                    <Route 
                      path="/knowledge-base" 
                      element={
                        <PrivateRoute>
                          <KnowledgeBase />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/knowledge-base/article/:id" 
                      element={
                        <PrivateRoute>
                          <KnowledgeBaseArticleView />
                        </PrivateRoute>
                      } 
                    />
                    
                    {/* Admin routes */}
                    <Route 
                      path="/admin/users" 
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <UserManagement />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/admin/roles" 
                      element={
                        <PrivateRoute roles={['ADMIN']}>
                          <RoleManagement />
                        </PrivateRoute>
                      } 
                    />
                  </Route>
                  
                  {/* Error routes */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default App; 