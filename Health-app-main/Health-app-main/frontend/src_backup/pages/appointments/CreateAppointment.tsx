import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';

interface AppointmentFormValues {
  doctorId: string;
  dateTime: Date | null;
  reason: string;
}

export default function CreateAppointment() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: AppointmentFormValues) => {
    if (!user) {
      showNotification('You must be logged in to create an appointment', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase.from('appointments').insert({
        patient_id: user.id,
        doctor_id: formData.doctorId,
        appointment_date: formData.dateTime,
        reason: formData.reason,
        status: 'pending'
      });

      if (error) throw error;

      showNotification('Appointment scheduled successfully!', 'success');
      navigate('/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to schedule appointment',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Schedule New Appointment
        </Typography>
        <AppointmentForm onSubmit={handleSubmit} />
      </Box>
    </Container>
  );
} 