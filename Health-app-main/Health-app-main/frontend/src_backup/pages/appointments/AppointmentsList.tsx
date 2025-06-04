import React, { useState } from 'react';
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
  TextField,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../hooks/useAppointments';
import './Appointments.css';

// Define appointment status types and colors
type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';

const statusColors: Record<AppointmentStatus, string> = {
  SCHEDULED: 'primary',
  CONFIRMED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'warning',
  RESCHEDULED: 'info'
};

const AppointmentsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPatient = user?.user_metadata?.roles?.includes('PATIENT');
  const isDoctor = user?.user_metadata?.roles?.includes('DOCTOR');
  
  // State for filtering and sorting
  const [filter, setFilter] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });
  
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    appointmentId: null as string | null
  });
  
  // Fetch appointments
  const { data: appointments, isLoading, error } = useQuery<Appointment[], Error>(
    ['appointments', filter],
    async () => {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      
      const response = await axios.get(`/api/appointments?${params.toString()}`);
      return response.data;
    }
  );
  
  // Cancel appointment mutation
  const cancelMutation = useMutation(
    (appointmentId: string) => axios.post(`/api/appointments/${appointmentId}/cancel`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        setDeleteDialog({ open: false, appointmentId: null });
      }
    }
  );
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };
  
  const handleDeleteClick = (appointmentId: string) => {
    setDeleteDialog({
      open: true,
      appointmentId
    });
  };
  
  const handleDeleteConfirm = () => {
    if (deleteDialog.appointmentId) {
      cancelMutation.mutate(deleteDialog.appointmentId);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      appointmentId: null
    });
  };
  
  const renderStatus = (status: AppointmentStatus) => {
    return (
      <Chip 
        label={status} 
        color={statusColors[status] as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"} 
        size="small" 
        variant="outlined" 
      />
    );
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
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
  
  return (
    <div className="appointments-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" className="page-title">
          Appointments
        </Typography>
        
        {isPatient && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/appointments/new')}
          >
            Schedule New Appointment
          </Button>
        )}
      </Box>
      
      {/* Filters */}
      <Paper elevation={2} className="filter-paper">
        <Box p={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <FilterIcon color="action" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                name="status"
                label="Status"
                variant="outlined"
                size="small"
                value={filter.status}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="NO_SHOW">No Show</MenuItem>
                <MenuItem value="RESCHEDULED">Rescheduled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="startDate"
                label="From"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filter.startDate}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="endDate"
                label="To"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filter.endDate}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => setFilter({ status: '', startDate: '', endDate: '' })}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Appointments Table */}
      <Paper elevation={3} style={{ marginTop: '16px' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                {isDoctor && <TableCell>Patient</TableCell>}
                {isPatient && <TableCell>Doctor</TableCell>}
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments && appointments.length > 0 ? (
                appointments.map((appointment: Appointment) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>
                      {new Date(appointment.startTime).toLocaleDateString()}<br />
                      <Typography variant="caption" color="textSecondary">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    
                    {isDoctor && (
                      <TableCell>
                        {/* Note: In actual implementation, patientInfo would be fetched */}
                        Patient Name
                      </TableCell>
                    )}
                    
                    {isPatient && (
                      <TableCell>
                        {appointment.doctor.name}
                        <Typography variant="caption" display="block" color="textSecondary">
                          {appointment.doctor.specialty}
                        </Typography>
                      </TableCell>
                    )}
                    
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>{renderStatus(appointment.status as AppointmentStatus)}</TableCell>
                    
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {appointment.status === 'SCHEDULED' && (
                        <>
                          <IconButton 
                            color="secondary" 
                            onClick={() => navigate(`/appointments/edit/${appointment.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                          
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(appointment.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" style={{ padding: '16px' }}>
                      No appointments found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Calendar View Button */}
      <Box mt={2} display="flex" justifyContent="center">
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/appointments/calendar')}
        >
          Switch to Calendar View
        </Button>
      </Box>
      
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
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
            disabled={cancelMutation.isLoading}
          >
            {cancelMutation.isLoading ? 'Cancelling...' : 'Yes, Cancel It'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AppointmentsList; 