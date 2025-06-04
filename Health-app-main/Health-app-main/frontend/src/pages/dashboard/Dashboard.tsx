import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';
import WelcomeCard from './WelcomeCard';
import { Appointment, Message, Notification, HealthMetrics } from '../../types/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPatient = user?.user_metadata?.role === 'PATIENT';
  const isDoctor = user?.user_metadata?.role === 'DOCTOR';
  const isAdmin = user?.user_metadata?.role === 'ADMIN';

  // Fetch upcoming appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>(
    'upcomingAppointments',
    async () => {
      const response = await axios.get('/api/appointments/upcoming');
      return response.data;
    },
    { enabled: !!user }
  );

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>(
    'notifications',
    async () => {
      const response = await axios.get('/api/notifications');
      return response.data;
    },
    { enabled: !!user }
  );

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>(
    'recentMessages',
    async () => {
      const response = await axios.get('/api/messages/recent');
      return response.data;
    },
    { enabled: !!user }
  );

  // Fetch health metrics if user is a patient
  const { data: healthMetrics, isLoading: healthLoading } = useQuery<HealthMetrics>(
    'healthMetrics',
    async () => {
      const response = await axios.get('/api/health-metrics/recent');
      return response.data;
    },
    { enabled: !!user && isPatient }
  );

  // Calculate pending results (example logic)
  const pendingResults = notifications?.filter(n => 
    n.type === 'TEST_RESULT' && !n.read
  ).length || 0;

  // Filter for upcoming appointments: status 'confirmed' and startTime in the future
  const now = new Date();
  const upcomingAppointments = (appointments || []).filter(
    (appointment) =>
      appointment.status === 'confirmed' &&
      new Date(appointment.startTime) > now
  );

  return (
    <div className="dashboard-container">
      {/* New Welcome Card with Aceternity UI */}
      <Box mb={2}>
        <WelcomeCard 
          userName={user?.user_metadata?.firstName || 'User'} 
          upcomingAppointments={appointments?.length || 0}
          pendingResults={pendingResults}
        />
      </Box>
      {/* Add Find Doctor Button for Patients only */}
      {isPatient && (
        <Box mb={2} textAlign="center">
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/find-doctor')}
            style={{ background: '#7c3aed', color: '#fff', borderRadius: '8px', fontWeight: 600 }}
          >
            Find Doctors Near Me
          </Button>
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Paper className="dashboard-card">
            <Box className="card-header">
              <TodayIcon />
              <Typography variant="h6" fontWeight={600}>Upcoming Appointments</Typography>
            </Box>
            <Divider />
            {appointmentsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
              <List>
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <ListItem key={appointment.id} button onClick={() => navigate(`/appointments/${appointment.id}`)}>
                    <ListItemText
                      primary={appointment.title}
                      secondary={
                        <>
                          <AccessTimeIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                          {new Date(appointment.startTime).toLocaleString()}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={180}>
                <Typography sx={{ mb: 3 }}>Upcoming Appointments</Typography>
                <Box display="flex" flexDirection="row" gap={3} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    sx={{ py: 1.5, px: 3, fontWeight: 600, fontSize: '1rem', borderRadius: '999px' }}
                    onClick={() => navigate(isDoctor ? '/appointments/doctor' : '/appointments')}
                  >
                    View All Appointments
                  </Button>
                  {isPatient && (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => navigate('/appointments/new')}
                      sx={{ fontWeight: 600, borderRadius: '8px', px: 4 }}
                    >
                      Book New
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Health Metrics for Patients */}
        {isPatient && (
          <Grid item xs={12} md={6}>
            <Paper className="dashboard-card">
              <Box className="card-header">
                <FavoriteIcon />
                <Typography variant="h6" fontWeight={600}>Health Metrics</Typography>
              </Box>
              <Divider />
              {healthLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : healthMetrics ? (
                <Box p={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Heart Rate
                          </Typography>
                          <Typography variant="h5">
                            {healthMetrics.HEART_RATE || '--'} BPM
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Blood Pressure
                          </Typography>
                          <Typography variant="h5">
                            {healthMetrics.BLOOD_PRESSURE_SYSTOLIC || '--'}/{healthMetrics.BLOOD_PRESSURE_DIASTOLIC || '--'} mmHg
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Oxygen Level
                          </Typography>
                          <Typography variant="h5">
                            {healthMetrics.OXYGEN_LEVEL || '--'}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Temperature
                          </Typography>
                          <Typography variant="h5">
                            {healthMetrics.TEMPERATURE || '--'} °C
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={180}>
                  <Typography sx={{ mb: 3 }}>Health Data Not Available</Typography>
                  <Box display="flex" flexDirection="row" gap={3} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      sx={{ py: 1.5, px: 3, fontWeight: 600, fontSize: '1rem', borderRadius: '999px' }}
                      onClick={() => navigate('/health-metrics')}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => navigate('/health-metrics/add')}
                      sx={{ fontWeight: 600, borderRadius: '8px', px: 4 }}
                    >
                      Add Data
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Doctor's Patient List - Only for doctors */}
        {isDoctor && (
          <Grid item xs={12} md={6}>
            <Paper className="dashboard-card">
              <Box className="card-header">
                <FavoriteIcon />
                <Typography variant="h6" fontWeight={600}>My Patients</Typography>
              </Box>
              <Divider />
              {/* TODO: Replace with real patient data from backend */}
              <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={180}>
                <Typography sx={{ mb: 3 }}>Patient List</Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{ py: 1.5, px: 3, fontWeight: 600, fontSize: '1rem', borderRadius: '999px' }}
                  onClick={() => navigate('/patients')}
                >
                  View All Patients
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Admin Statistics - Only for admins */}
        {isAdmin && (
          <Grid item xs={12} md={6}>
            <Paper className="dashboard-card">
              <Box className="card-header">
                <NotificationsIcon />
                <Typography variant="h6" fontWeight={600}>System Statistics</Typography>
              </Box>
              <Divider />
              <Box p={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Users
                        </Typography>
                        <Typography variant="h5">
                          247
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Appointments
                        </Typography>
                        <Typography variant="h5">
                          352
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Active Doctors
                        </Typography>
                        <Typography variant="h5">
                          18
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          System Status
                        </Typography>
                        <Typography variant="h5" style={{ color: '#4caf50' }}>
                          Healthy
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              <Box p={1} textAlign="center">
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => navigate('/admin/dashboard')}
                  sx={{ color: '#7c3aed', borderColor: '#a78bfa', fontWeight: 600, borderRadius: 2 }}
                >
                  Admin Dashboard
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Recent Messages */}
        <Grid item xs={12} md={6}>
          <Paper className="dashboard-card">
            <Box className="card-header">
              <MessageIcon />
              <Typography variant="h6" fontWeight={600}>Recent Messages</Typography>
            </Box>
            <Divider />
            {messagesLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : messages && messages.length > 0 ? (
              <List>
                {messages.slice(0, 3).map((message) => (
                  <ListItem key={message.id} button onClick={() => navigate('/messages')}>
                    <ListItemText
                      primary={message.sender}
                      secondary={
                        <>
                          {message.content.substring(0, 50)}
                          {message.content.length > 50 ? '...' : ''}
                          <Typography variant="caption" display="block" color="textSecondary">
                            {new Date(message.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={180}>
                <Typography sx={{ mb: 3 }}>Recent Messages</Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{ py: 1.5, px: 3, fontWeight: 600, fontSize: '1rem', borderRadius: '999px' }}
                  onClick={() => navigate('/messages')}
                >
                  View All Messages
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper className="dashboard-card">
            <Box className="card-header">
              <NotificationsIcon />
              <Typography variant="h6" fontWeight={600}>Notifications</Typography>
            </Box>
            <Divider />
            {notificationsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : notifications && notifications.length > 0 ? (
              <List>
                {notifications.slice(0, 3).map((notification) => (
                  <ListItem key={notification.id} button>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          {notification.message}
                          <Typography variant="caption" display="block" color="textSecondary">
                            {new Date(notification.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={180}>
                <Typography sx={{ mb: 3 }}>Notifications</Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{ py: 1.5, px: 3, fontWeight: 600, fontSize: '1rem', borderRadius: '999px' }}
                  onClick={() => navigate('/notifications')}
                >
                  View All Notifications
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Test Health Box - Centered below Messages and Notifications */}
        {isPatient && (
          <Grid item xs={12} md={6} style={{ margin: '0 auto' }}>
            <Paper className="dashboard-card">
              <Box className="card-header">
                <FavoriteIcon />
                <Typography variant="h6" fontWeight={600}>Test Health</Typography>
              </Box>
              <Divider />
              <Box p={3} textAlign="center">
                <Typography>Track and analyze your health metrics at key medication intervals.</Typography>
              </Box>
              <Box p={1} textAlign="center">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate('/test-health')}
                  sx={{ bgcolor: '#7c3aed', color: '#fff', '&:hover': { bgcolor: '#6d28d9' } }}
                >
                  Go to Test Health
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default Dashboard; 