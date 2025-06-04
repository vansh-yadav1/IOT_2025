import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Place as PlaceIcon,
  ExpandMore as ExpandMoreIcon,
  Notes as NotesIcon,
  MedicalServices as MedicalServicesIcon,
  Schedule as ScheduleIcon,
  VideoCameraFront as VideoCameraFrontIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useAppointment } from '../../hooks/useAppointment';
import { useNotification } from '../../context/NotificationContext';

// Define status colors for consistent styling
const statusColors: Record<string, string> = {
  SCHEDULED: 'primary',
  CONFIRMED: 'success',
  COMPLETED: 'default',
  CANCELLED: 'error',
  NO_SHOW: 'warning',
  RESCHEDULED: 'secondary'
};

// Define appointment type icons
const typeIcons: Record<string, React.ReactNode> = {
  IN_PERSON: <MedicalServicesIcon />,
  VIRTUAL: <VideoCameraFrontIcon />,
  PHONE: <ScheduleIcon />
};

const StatusUpdateForm = ({ onSubmit, onCancel }: { onSubmit: (status: string) => void, onCancel: () => void }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Update Status</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      This feature is currently under development.
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button onClick={onCancel}>Cancel</Button>
      <Button variant="contained" onClick={() => onSubmit('CONFIRMED')}>Confirm</Button>
    </Box>
  </Box>
);

const AppointmentTimeline = ({ appointment }: { appointment: any }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Appointment Timeline</Typography>
    <Typography variant="body2" color="text.secondary">
      Timeline feature is coming soon.
    </Typography>
  </Box>
);

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const { 
    data: appointment, 
    isLoading, 
    error, 
    updateAppointmentStatus, 
    cancelAppointment,
    isUpdating 
  } = useAppointment(id);
  
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" my={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading appointment: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  if (!appointment) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Appointment not found
        </Alert>
      </Box>
    );
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateAppointmentStatus(newStatus);
      showNotification('Appointment status updated successfully', 'success');
      setOpenStatusDialog(false);
    } catch (error) {
      showNotification(`Failed to update status: ${(error as Error).message}`, 'error');
    }
  };

  const handleCancelAppointment = async () => {
    try {
      await cancelAppointment();
      showNotification('Appointment cancelled successfully', 'success');
      setOpenCancelDialog(false);
    } catch (error) {
      showNotification(`Failed to cancel appointment: ${(error as Error).message}`, 'error');
    }
  };

  const handleEdit = () => {
    navigate(`/appointments/edit/${id}`);
  };

  const handleJoinMeeting = () => {
    if (appointment?.meetingLink) {
      window.open(appointment.meetingLink, '_blank');
    } else {
      showNotification('No meeting link available', 'warning');
    }
  };

  const startDate = parseISO(appointment.startTime);
  const endDate = parseISO(appointment.endTime);
  const formattedDate = format(startDate, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startDate, 'h:mm a');
  const formattedEndTime = format(endDate, 'h:mm a');
  const isPastAppointment = new Date() > endDate;
  const isVirtual = appointment.type === 'VIRTUAL';

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/appointments');
          }}
        >
          Appointments
        </Link>
        <Typography color="text.primary">Appointment Details</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/appointments')}
            size="small"
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            Appointment Details
          </Typography>
        </Box>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          {!isPastAppointment && (
            <>
              {isVirtual && appointment.status !== 'CANCELLED' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleJoinMeeting}
                  startIcon={<VideoCameraFrontIcon />}
                  disabled={!appointment.meetingLink}
                >
                  Join Meeting
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              {appointment.status !== 'CANCELLED' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenCancelDialog(true)}
                >
                  Cancel
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Main content */}
      <Grid container spacing={3}>
        {/* Appointment summary */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="flex-start"
              flexWrap="wrap"
              gap={2}
              mb={2}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  {appointment.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {appointment.reason}
                </Typography>
              </Box>
              
              <Chip 
                label={appointment.status.replace('_', ' ')} 
                color={statusColors[appointment.status] as any}
                variant="filled"
                onClick={() => !isPastAppointment && setOpenStatusDialog(true)}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" gap={1} alignItems="center">
                  <EventIcon color="primary" />
                  <Typography variant="body1">
                    {formattedDate}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" gap={1} alignItems="center">
                  <AccessTimeIcon color="primary" />
                  <Typography variant="body1">
                    {formattedStartTime} - {formattedEndTime}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" gap={1} alignItems="center">
                  <PersonIcon color="primary" />
                  <Typography variant="body1">
                    {appointment.doctor?.name || 'Not assigned'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" gap={1} alignItems="center">
                  {typeIcons[appointment.type] && (
                    <Box color="primary.main">
                      {typeIcons[appointment.type]}
                    </Box>
                  )}
                  <Typography variant="body1">
                    {appointment.type.replace('_', ' ')} Appointment
                  </Typography>
                </Box>
              </Grid>
              
              {appointment.location && (
                <Grid item xs={12}>
                  <Box display="flex" gap={1} alignItems="center">
                    <PlaceIcon color="primary" />
                    <Typography variant="body1">
                      {appointment.location}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
            
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="notes-content"
                id="notes-header"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <NotesIcon />
                  <Typography>Notes & Instructions</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  {appointment.notes || 'No notes provided for this appointment.'}
                </Typography>
                
                {appointment.instructions && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                      Patient Instructions:
                    </Typography>
                    <Typography variant="body1">
                      {appointment.instructions}
                    </Typography>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
        
        {/* Timeline and additional info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appointment Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <AppointmentTimeline appointment={appointment} />
          </Paper>
          
          {appointment.insurance && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Insurance Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Provider
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {appointment.insurance.provider}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Policy Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {appointment.insurance.policyNumber}
                </Typography>
                
                {appointment.insurance.groupNumber && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Group Number
                    </Typography>
                    <Typography variant="body1">
                      {appointment.insurance.groupNumber}
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Cancel Appointment Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancel Appointment
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>
            No, Keep It
          </Button>
          <Button 
            onClick={handleCancelAppointment} 
            color="error" 
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? 'Cancelling...' : 'Yes, Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        aria-labelledby="status-dialog-title"
      >
        <DialogTitle id="status-dialog-title">
          Update Appointment Status
        </DialogTitle>
        <DialogContent>
          <StatusUpdateForm 
            onSubmit={handleStatusUpdate}
            onCancel={() => setOpenStatusDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AppointmentDetails; 