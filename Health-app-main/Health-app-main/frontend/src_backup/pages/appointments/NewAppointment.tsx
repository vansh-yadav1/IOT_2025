import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { 
  Close as CloseIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateAppointment, useUpdateAppointment } from '../../hooks/useAppointments';
import { useAppointment } from '../../hooks/useAppointment';
import { useDoctors } from '../../hooks/useDoctors';
import { useNotification } from '../../context/NotificationContext';

type AppointmentType = 'IN_PERSON' | 'VIRTUAL';
type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';

// Define Doctor interface to match the API
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  department?: string;
  hospital?: string;
}

interface AppointmentFormData {
  title: string;
  doctorId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes: string;
  startTime: Date | null;
  endTime: Date | null;
  location?: string;
  meetingLink?: string;
}

interface ValidationErrors {
  title?: string;
  doctorId?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

const NewAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const initialFormData: AppointmentFormData = {
    title: '',
    doctorId: '',
    type: 'IN_PERSON',
    status: 'SCHEDULED',
    reason: '',
    notes: '',
    startTime: null,
    endTime: null,
    location: '',
    meetingLink: ''
  };

  const [formData, setFormData] = useState<AppointmentFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const { doctors, loading: loadingDoctors } = useDoctors();
  const { 
    data: existingAppointment, 
    isLoading: loadingAppointment,
    error: appointmentError 
  } = useAppointment(id as string);

  // Load existing appointment data when editing
  useEffect(() => {
    if (isEditing && existingAppointment) {
      setFormData({
        title: existingAppointment.title,
        doctorId: existingAppointment.doctorId,
        type: existingAppointment.type as AppointmentType,
        status: existingAppointment.status as AppointmentStatus,
        reason: existingAppointment.reason || '',
        notes: existingAppointment.notes || '',
        startTime: new Date(existingAppointment.startTime),
        endTime: new Date(existingAppointment.endTime),
        location: existingAppointment.location || '',
        meetingLink: existingAppointment.meetingLink || ''
      });
    }
  }, [existingAppointment, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.doctorId) {
      newErrors.doctorId = 'Doctor is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    if (formData.type === 'IN_PERSON' && !formData.location?.trim()) {
      newErrors.location = 'Location is required for in-person appointments';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    
    // Clear error when user selects a date
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format data for API
    const appointmentData = {
      ...formData,
      // Ensure startTime and endTime are always strings and never undefined
      startTime: formData.startTime ? formData.startTime.toISOString() : new Date().toISOString(),
      endTime: formData.endTime ? formData.endTime.toISOString() : new Date(Date.now() + 30 * 60000).toISOString()
    };
    
    try {
      if (isEditing) {
        await updateMutation.updateAppointment(id as string, appointmentData);
        showNotification('Appointment updated successfully', 'success');
      } else {
        await createMutation.createAppointment(appointmentData);
        showNotification('Appointment created successfully', 'success');
      }
      navigate('/appointments');
    } catch (error) {
      showNotification(`Failed to ${isEditing ? 'update' : 'create'} appointment: ${(error as Error).message}`, 'error');
    }
  };

  if ((isEditing && loadingAppointment) || loadingDoctors) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isEditing && appointmentError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading appointment: {(appointmentError as Error).message}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/appointments')}
          sx={{ mt: 2 }}
        >
          Back to Appointments
        </Button>
      </Box>
    );
  }

  const getEndTimeDefault = () => {
    if (formData.startTime) {
      const defaultEnd = new Date(formData.startTime);
      defaultEnd.setMinutes(defaultEnd.getMinutes() + 30);
      return defaultEnd;
    }
    return null;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          {isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}
        </Typography>
        <IconButton onClick={() => navigate('/appointments')}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Appointment Title"
              value={formData.title}
              onChange={handleInputChange}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.doctorId} required>
              <InputLabel id="doctor-select-label">Doctor</InputLabel>
              <Select
                labelId="doctor-select-label"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleSelectChange}
                label="Doctor"
              >
                {doctors && doctors.length > 0 ? (
                  doctors.map((doctor: Doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="1">Dr. Smith</MenuItem>
                )}
              </Select>
              {errors.doctorId && <FormHelperText>{errors.doctorId}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="type-select-label">Appointment Type</InputLabel>
              <Select
                labelId="type-select-label"
                name="type"
                value={formData.type}
                onChange={handleSelectChange}
                label="Appointment Type"
              >
                <MenuItem value="IN_PERSON">In-Person</MenuItem>
                <MenuItem value="VIRTUAL">Virtual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {formData.type === 'IN_PERSON' && (
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleInputChange}
                error={!!errors.location}
                helperText={errors.location}
                fullWidth
                required={formData.type === 'IN_PERSON'}
              />
            </Grid>
          )}
          
          {formData.type === 'VIRTUAL' && (
            <Grid item xs={12}>
              <TextField
                name="meetingLink"
                label="Meeting Link"
                value={formData.meetingLink}
                onChange={handleInputChange}
                fullWidth
                placeholder="https://telehealth.hospital.com/room/12345"
              />
            </Grid>
          )}
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date"
              value={formData.startTime}
              onChange={(date) => {
                if (date) {
                  // Keep the time part from the existing startTime
                  if (formData.startTime) {
                    const newDate = new Date(date);
                    newDate.setHours(
                      formData.startTime.getHours(),
                      formData.startTime.getMinutes()
                    );
                    handleDateChange('startTime', newDate);
                    
                    // Update end time if it exists
                    if (formData.endTime) {
                      const timeDiff = formData.endTime.getTime() - formData.startTime.getTime();
                      const newEndTime = new Date(newDate.getTime() + timeDiff);
                      handleDateChange('endTime', newEndTime);
                    }
                  } else {
                    // Set default time (9:00 AM) if no time is set
                    const newDate = new Date(date);
                    newDate.setHours(9, 0, 0, 0);
                    handleDateChange('startTime', newDate);
                    
                    // Set default end time (30 minutes later)
                    const endTime = new Date(newDate);
                    endTime.setMinutes(endTime.getMinutes() + 30);
                    handleDateChange('endTime', endTime);
                  }
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.startTime,
                  helperText: errors.startTime
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Start Time"
              value={formData.startTime}
              onChange={(time) => {
                handleDateChange('startTime', time);
                
                // Update end time to be 30 minutes later if it's not set
                // or if end time is before the new start time
                if (!formData.endTime || (time && formData.endTime <= time)) {
                  const newEndTime = new Date(time as Date);
                  newEndTime.setMinutes(newEndTime.getMinutes() + 30);
                  handleDateChange('endTime', newEndTime);
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.startTime,
                  helperText: errors.startTime
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="End Time"
              value={formData.endTime || getEndTimeDefault()}
              onChange={(time) => handleDateChange('endTime', time)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.endTime,
                  helperText: errors.endTime
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {isEditing && (
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="NO_SHOW">No Show</MenuItem>
                  <MenuItem value="RESCHEDULED">Rescheduled</MenuItem>
                </Select>
              </FormControl>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="reason"
              label="Reason for Visit"
              value={formData.reason}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Additional Notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/appointments')}
              startIcon={<ArrowBackIcon />}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={createMutation.loading || updateMutation.loading}
            >
              {(createMutation.loading || updateMutation.loading) ? (
                <CircularProgress size={24} />
              ) : isEditing ? 'Update Appointment' : 'Schedule Appointment'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default NewAppointment; 