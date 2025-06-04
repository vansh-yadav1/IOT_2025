import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Doctor } from '../../hooks/useDoctors';
import { AppointmentFormData } from '../../hooks/useAppointments';
import { addHours } from 'date-fns';
import { AppointmentType } from '../../types/appointment';

interface AppointmentFormProps {
  doctors: Doctor[];
  initialValues?: Partial<AppointmentFormData>;
  loading?: boolean;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  doctors,
  initialValues,
  loading = false,
  onSubmit,
  onCancel,
  isEditMode = false
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: initialValues?.title || '',
    doctorId: initialValues?.doctorId || '',
    patientId: initialValues?.patientId || '',
    startTime: initialValues?.startTime || new Date().toISOString(),
    endTime: initialValues?.endTime || addHours(new Date(), 1).toISOString(),
    type: initialValues?.type || AppointmentType.IN_PERSON,
    reason: initialValues?.reason || '',
    notes: initialValues?.notes || '',
    location: initialValues?.location || '',
    meetingLink: initialValues?.meetingLink || '',
    insurance: initialValues?.insurance || {
      provider: '',
      policyNumber: '',
      groupNumber: ''
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => {
        // Ensure insurance fields have default values if not provided
        const mergedInsurance = {
          provider: prev.insurance?.provider || '',
          policyNumber: prev.insurance?.policyNumber || '',
          groupNumber: prev.insurance?.groupNumber || undefined,
          ...initialValues.insurance
        };
        
        return {
          ...prev,
          ...initialValues,
          insurance: mergedInsurance
        };
      });
    }
  }, [initialValues]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('insurance.')) {
      const insuranceField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        insurance: {
          ...prev.insurance!,
          [insuranceField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleStartTimeChange = (date: Date | null) => {
    if (date) {
      const endTime = addHours(date, 1);
      setFormData(prev => ({
        ...prev,
        startTime: date.toISOString(),
        endTime: endTime.toISOString()
      }));
    }
  };
  
  const handleEndTimeChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        endTime: date.toISOString()
      }));
    }
  };
  
  const handleAppointmentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typeValue = e.target.value;
    const type = typeValue === 'IN_PERSON' ? AppointmentType.IN_PERSON : AppointmentType.VIRTUAL;
    
    setFormData(prev => ({
      ...prev,
      type: type,
      // Clear location or meetingLink based on appointment type
      location: type === AppointmentType.IN_PERSON ? prev.location : '',
      meetingLink: type === AppointmentType.VIRTUAL ? prev.meetingLink : ''
    }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) {
      newErrors.title = 'Appointment title is required';
    }
    
    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }
    
    if (formData.type === AppointmentType.IN_PERSON && !formData.location) {
      newErrors.location = 'Location is required for in-person appointments';
    }
    
    if (formData.type === AppointmentType.VIRTUAL && !formData.meetingLink) {
      newErrors.meetingLink = 'Meeting link is required for virtual appointments';
    }
    
    if (!formData.reason) {
      newErrors.reason = 'Reason for appointment is required';
    }
    
    if (formData.insurance?.provider && !formData.insurance.policyNumber) {
      newErrors['insurance.policyNumber'] = 'Policy number is required';
    }
    
    // Validate start time is before end time
    const startTime = new Date(formData.startTime || new Date());
    const endTime = new Date(formData.endTime || addHours(new Date(), 1));
    
    if (startTime >= endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" mb={3}>
        {isEditMode ? 'Edit Appointment' : 'Schedule New Appointment'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Appointment Title */}
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Appointment Title"
              fullWidth
              required
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              disabled={loading}
            />
          </Grid>
          
          {/* Doctor Selection */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              name="doctorId"
              label="Doctor"
              fullWidth
              required
              value={formData.doctorId}
              onChange={handleChange}
              error={!!errors.doctorId}
              helperText={errors.doctorId}
              disabled={loading}
            >
              <MenuItem value="" disabled>
                Select a doctor
              </MenuItem>
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {/* Appointment Type */}
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Appointment Type</FormLabel>
              <RadioGroup
                row
                name="type"
                value={formData.type.toString()}
                onChange={handleAppointmentTypeChange}
              >
                <FormControlLabel
                  value="IN_PERSON"
                  control={<Radio />}
                  label="In-person"
                  disabled={loading}
                />
                <FormControlLabel
                  value="VIRTUAL"
                  control={<Radio />}
                  label="Virtual"
                  disabled={loading}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          {/* Conditional fields based on appointment type */}
          {formData.type === AppointmentType.IN_PERSON && (
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Location"
                fullWidth
                required
                value={formData.location}
                onChange={handleChange}
                error={!!errors.location}
                helperText={errors.location}
                disabled={loading}
              />
            </Grid>
          )}
          
          {formData.type === AppointmentType.VIRTUAL && (
            <Grid item xs={12}>
              <TextField
                name="meetingLink"
                label="Meeting Link"
                fullWidth
                required
                value={formData.meetingLink}
                onChange={handleChange}
                error={!!errors.meetingLink}
                helperText={errors.meetingLink}
                disabled={loading}
              />
            </Grid>
          )}
          
          {/* Date/Time Pickers */}
          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Start Time"
              value={formData.startTime ? new Date(formData.startTime) : null}
              onChange={handleStartTimeChange}
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
            <DateTimePicker
              label="End Time"
              value={formData.endTime ? new Date(formData.endTime) : null}
              onChange={handleEndTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.endTime,
                  helperText: errors.endTime
                }
              }}
            />
          </Grid>
          
          {/* Reason for Visit */}
          <Grid item xs={12}>
            <TextField
              name="reason"
              label="Reason for Visit"
              multiline
              rows={3}
              fullWidth
              required
              value={formData.reason}
              onChange={handleChange}
              error={!!errors.reason}
              helperText={errors.reason}
              disabled={loading}
            />
          </Grid>
          
          {/* Additional Notes */}
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Additional Notes"
              multiline
              rows={3}
              fullWidth
              value={formData.notes}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          
          {/* Insurance Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Insurance Information (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="insurance.provider"
                  label="Insurance Provider"
                  fullWidth
                  value={formData.insurance?.provider || ''}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="insurance.policyNumber"
                  label="Policy Number"
                  fullWidth
                  value={formData.insurance?.policyNumber || ''}
                  onChange={handleChange}
                  error={!!errors['insurance.policyNumber']}
                  helperText={errors['insurance.policyNumber']}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="insurance.groupNumber"
                  label="Group Number (Optional)"
                  fullWidth
                  value={formData.insurance?.groupNumber || ''}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Form Actions */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {isEditMode ? 'Update Appointment' : 'Schedule Appointment'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AppointmentForm; 