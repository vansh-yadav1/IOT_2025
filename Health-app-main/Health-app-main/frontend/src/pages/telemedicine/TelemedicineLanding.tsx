import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon,
  NavigateNext as NavigateNextIcon,
  AccessTime as AccessTimeIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { format, isBefore, isAfter, addMinutes, parseISO } from 'date-fns';
import { useNotification } from '../../context/NotificationContext';

// Mock upcoming telemedicine appointments
const mockAppointments = [
  {
    id: '12345',
    title: 'Follow-up Consultation',
    doctor: {
      id: 'dr1',
      name: 'Dr. Mantas Singh',
      specialty: 'Cardiology',
      profileImage: '/assets/avatars/doctor1.jpg'
    },
    startTime: new Date(Date.now() + 15 * 60000).toISOString(), // 15 min from now
    endTime: new Date(Date.now() + 45 * 60000).toISOString(), // 45 min from now
    status: 'CONFIRMED',
    type: 'VIRTUAL'
  },
  {
    id: '23456',
    title: 'Medication Review',
    doctor: {
      id: 'dr2',
      name: 'Dr. Mantas Singh',
      specialty: 'Internal Medicine',
      profileImage: '/assets/avatars/doctor2.jpg'
    },
    startTime: new Date(Date.now() + 120 * 60000).toISOString(), // 2 hours from now
    endTime: new Date(Date.now() + 150 * 60000).toISOString(), // 2 hours 30 min from now
    status: 'SCHEDULED',
    type: 'VIRTUAL'
  },
  {
    id: '34567',
    title: 'Test Results Discussion',
    doctor: {
      id: 'dr3',
      name: 'Dr. Mantas Singh',
      specialty: 'Oncology',
      profileImage: '/assets/avatars/doctor3.jpg'
    },
    startTime: new Date(Date.now() + 24 * 60 * 60000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 24 * 60 * 60000 + 30 * 60000).toISOString(), // Tomorrow + 30 min
    status: 'CONFIRMED',
    type: 'VIRTUAL'
  }
];

// Mock past telemedicine sessions
const mockPastSessions = [
  {
    id: '45678',
    title: 'Initial Consultation',
    doctor: {
      id: 'dr4',
      name: 'Dr. James Wilson',
      specialty: 'Dermatology',
      profileImage: '/assets/avatars/doctor4.jpg'
    },
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(), // 1 week ago
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60000 + 30 * 60000).toISOString(), 
    status: 'COMPLETED',
    type: 'VIRTUAL',
    duration: '28 minutes',
    recordingAvailable: true
  },
  {
    id: '56789',
    title: 'Mental Health Check-in',
    doctor: {
      id: 'dr5',
      name: 'Dr. Lisa Martinez',
      specialty: 'Psychology',
      profileImage: '/assets/avatars/doctor5.jpg'
    },
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(), // 1 month ago
    endTime: new Date(Date.now() - 30 * 24 * 60 * 60000 + 60 * 60000).toISOString(),
    status: 'COMPLETED',
    type: 'VIRTUAL',
    duration: '45 minutes',
    recordingAvailable: false
  }
];

const TelemedicineLanding: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUpcomingAppointments(mockAppointments);
        setPastSessions(mockPastSessions);
      } catch (err) {
        setError(err as Error);
        showNotification('Failed to load telemedicine appointments', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [showNotification]);
  
  const canJoinSession = (appointment: any) => {
    const now = new Date();
    const start = parseISO(appointment.startTime);
    const end = parseISO(appointment.endTime);
    
    // Can join 10 minutes before start time and until end time
    return (
      isAfter(now, addMinutes(start, -10)) && 
      isBefore(now, end) &&
      appointment.status !== 'CANCELLED'
    );
  };
  
  const handleJoinSession = (appointmentId: string) => {
    navigate(`/telemedicine/${appointmentId}`);
  };
  
  const handleScheduleAppointment = () => {
    navigate('/appointments/new', { state: { type: 'VIRTUAL' } });
  };
  
  const handleViewAppointment = (appointmentId: string) => {
    navigate(`/appointments/${appointmentId}`);
  };
  
  const handleViewAllAppointments = () => {
    navigate('/appointments');
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load telemedicine data'}
        </Alert>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Find next session that can be joined
  const nextSession = upcomingAppointments.find(canJoinSession);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Telemedicine</Typography>
      </Breadcrumbs>
      
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Telemedicine Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with your healthcare providers through secure video consultations.
        </Typography>
      </Box>
      
      {/* Next Session Card */}
      <Paper elevation={2} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Your Next Video Consultation
        </Typography>
        
        {nextSession ? (
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="h6" color="primary">
                  {nextSession.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1, gap: 1 }}>
                  <EventIcon color="action" fontSize="small" />
                  <Typography variant="body1">
                    {format(parseISO(nextSession.startTime), 'EEEE, MMMM d, yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1, gap: 1 }}>
                  <AccessTimeIcon color="action" fontSize="small" />
                  <Typography variant="body1">
                    {format(parseISO(nextSession.startTime), 'h:mm a')} - {format(parseISO(nextSession.endTime), 'h:mm a')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1, gap: 1 }}>
                  <PersonIcon color="action" fontSize="small" />
                  <Typography variant="body1">
                    {nextSession.doctor.name} ({nextSession.doctor.specialty})
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={nextSession.status} 
                    color={nextSession.status === 'CONFIRMED' ? 'success' : 'primary'} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    icon={<VideocamIcon />} 
                    label="Video Consultation" 
                    variant="outlined" 
                    size="small" 
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<VideocamIcon />}
                onClick={() => handleJoinSession(nextSession.id)}
                sx={{ mb: 1, width: { xs: '100%', md: 'auto' } }}
              >
                Join Session Now
              </Button>
              <Typography variant="body2" color="text.secondary">
                Your session is ready to join
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No upcoming video consultations that can be joined right now
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleScheduleAppointment}
              sx={{ mt: 2 }}
            >
              Schedule a Telemedicine Appointment
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Upcoming Appointments */}
      <Paper elevation={2} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Upcoming Video Consultations
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={handleViewAllAppointments}
          >
            View All
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {upcomingAppointments.length > 0 ? (
          <List>
            {upcomingAppointments.map((appointment) => {
              const canJoin = canJoinSession(appointment);
              return (
                <ListItem
                  key={appointment.id}
                  alignItems="flex-start"
                  sx={{ 
                    mb: 1,
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } 
                  }}
                >
                  <ListItemAvatar>
                    <Avatar alt={appointment.doctor.name} src={appointment.doctor.profileImage} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {appointment.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.primary" component="span">
                          {appointment.doctor.name}
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                          {format(parseISO(appointment.startTime), 'EEE, MMM d • h:mm a')}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    {canJoin ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VideocamIcon />}
                        onClick={() => handleJoinSession(appointment.id)}
                      >
                        Join
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewAppointment(appointment.id)}
                      >
                        Details
                      </Button>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" color="text.secondary">
              No upcoming video consultations
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleScheduleAppointment}
              sx={{ mt: 2 }}
            >
              Schedule a Consultation
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Past Sessions */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Past Sessions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {pastSessions.length > 0 ? (
          <List>
            {pastSessions.map((session) => (
              <ListItem
                key={session.id}
                alignItems="flex-start"
                sx={{ 
                  mb: 1,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } 
                }}
              >
                <ListItemAvatar>
                  <Avatar alt={session.doctor.name} src={session.doctor.profileImage} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {session.title}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.primary" component="span">
                        {session.doctor.name}
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                        {format(parseISO(session.startTime), 'MMM d, yyyy')} • {session.duration}
                      </Typography>
                      {session.recordingAvailable && (
                        <Chip
                          label="Recording Available"
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewAppointment(session.id)}
                  >
                    View Summary
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" color="text.secondary">
              No past video consultations
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Additional Information */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VideocamIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">How It Works</Typography>
              </Box>
              <Typography variant="body2">
                Our secure video platform connects you directly with healthcare providers from the comfort of your home.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Learn More</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Preparing for Your Visit</Typography>
              </Box>
              <Typography variant="body2">
                Tips to ensure a smooth video consultation, including testing your equipment and preparing questions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Checklist</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HelpOutlineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Technical Support</Typography>
              </Box>
              <Typography variant="body2">
                Need help with your video appointment? Our support team is available to assist you.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Get Help</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TelemedicineLanding; 