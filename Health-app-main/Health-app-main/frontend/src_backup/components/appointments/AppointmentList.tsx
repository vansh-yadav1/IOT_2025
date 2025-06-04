import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Appointment } from '../../hooks/useAppointments';

// Define props interface
interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  error: Error | null;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

// Define appointment status colors
const statusColors: Record<string, "primary" | "success" | "error" | "warning" | "info" | "default"> = {
  SCHEDULED: 'primary',
  CONFIRMED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'warning',
  RESCHEDULED: 'info'
};

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  loading,
  error,
  onDelete,
  onEdit,
  onView
}) => {
  const navigate = useNavigate();
  
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    appointmentId: string | null;
  }>({
    open: false,
    appointmentId: null
  });
  
  const handleDeleteClick = (appointmentId: string) => {
    setDeleteDialog({
      open: true,
      appointmentId
    });
  };
  
  const handleDeleteConfirm = () => {
    if (deleteDialog.appointmentId && onDelete) {
      onDelete(deleteDialog.appointmentId);
      setDeleteDialog({
        open: false,
        appointmentId: null
      });
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      appointmentId: null
    });
  };
  
  const renderStatus = (status: string) => {
    return (
      <Chip 
        label={status} 
        color={statusColors[status] || 'default'} 
        size="small" 
        variant="outlined" 
      />
    );
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading appointments: {error.message}
        </Typography>
      </Box>
    );
  }
  
  if (!appointments || appointments.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography>No appointments found.</Typography>
        <Button 
          variant="contained" 
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate('/appointments/new')}
        >
          Schedule New Appointment
        </Button>
      </Box>
    );
  }
  
  return (
    <>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => {
              const startDate = new Date(appointment.startTime);
              const startTime = format(startDate, 'h:mm a');
              const endTime = format(new Date(appointment.endTime), 'h:mm a');
              
              return (
                <TableRow key={appointment.id}>
                  <TableCell>{format(startDate, 'MMM d, yyyy')}</TableCell>
                  <TableCell>{`${startTime} - ${endTime}`}</TableCell>
                  <TableCell>{appointment.doctor.name}</TableCell>
                  <TableCell>
                    {appointment.type === 'VIRTUAL' ? 'Telehealth' : 'In-person'}
                  </TableCell>
                  <TableCell>{renderStatus(appointment.status)}</TableCell>
                  <TableCell align="right">
                    <Box>
                      {onView && (
                        <IconButton 
                          size="small" 
                          onClick={() => onView(appointment.id)}
                          aria-label="view"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {onEdit && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                        <IconButton 
                          size="small" 
                          onClick={() => onEdit(appointment.id)}
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {onDelete && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(appointment.id)}
                          aria-label="delete"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            No, Keep It
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Yes, Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppointmentList; 