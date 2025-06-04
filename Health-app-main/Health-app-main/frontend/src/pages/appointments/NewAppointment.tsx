import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { supabase } from '../../services/supabaseClient';
import AppointmentList from '../../components/appointments/AppointmentList';
import { AppointmentStatus } from '../../types/appointment';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
}

const initialFormState = {
  title: '',
  doctorId: '',
  reason: '',
  notes: '',
  startTime: new Date(),
  endTime: new Date(new Date().getTime() + 60 * 60000),
};

const NewAppointment: React.FC = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialization');
      if (error) {
        setError(error.message);
        setDoctors([]);
      } else {
        setDoctors(data || []);
        setError(null);
      }
      setLoadingDoctors(false);
    };
    fetchDoctors();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to request an appointment.');
      setSubmitting(false);
      return;
    }
    const { title, doctorId, reason, notes, startTime, endTime } = formData;
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id: user.id,
          doctor_id: doctorId,
          title,
          reason,
          notes,
          start_time: startTime,
          end_time: endTime,
          status: 'pending',
        },
      ]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setFormData(initialFormState);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 8 }}>
        <Typography variant="h5" component="h1" mb={3} color="primary" fontWeight={700}>
          Request New Appointment
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={doctors}
                getOptionLabel={option => option.full_name || ''}
                value={doctors.find(doc => doc.id === formData.doctorId) || null}
                onChange={(_, value) => setFormData(prev => ({ ...prev, doctorId: value ? value.id : '' }))}
                loading={loadingDoctors}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Doctor"
                    required
                    fullWidth
                    error={!!error}
                    helperText={error}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="title"
                label="Appointment Title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={date => setFormData(prev => ({ ...prev, startTime: date || new Date() }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="End Time"
                value={formData.endTime}
                onChange={date => setFormData(prev => ({ ...prev, endTime: date || new Date() }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="reason"
                label="Reason for Visit"
                value={formData.reason}
                onChange={handleInputChange}
                fullWidth
                required
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
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : 'Send Request'}
              </Button>
            </Grid>
            {success && (
              <Grid item xs={12}>
                <Alert severity="success">Appointment request sent successfully!</Alert>
              </Grid>
            )}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>
      <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" mb={3} color="primary" fontWeight={700}>
          Upcoming Appointments
        </Typography>
        <AppointmentList role="patient" filters={{ status: ['confirmed'] }} />
      </Paper>
    </>
  );
};

export default NewAppointment; 