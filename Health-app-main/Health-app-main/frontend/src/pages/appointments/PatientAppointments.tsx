import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import AppointmentList from '../../components/appointments/AppointmentList';

const PatientAppointments: React.FC = () => (
  <Container>
    <Box mt={8}>
      <Typography variant="h4" mb={3}>My Appointments</Typography>
      <AppointmentList
        role="patient"
        filters={{ status: ['confirmed'] }}
      />
    </Box>
  </Container>
);

export default PatientAppointments; 