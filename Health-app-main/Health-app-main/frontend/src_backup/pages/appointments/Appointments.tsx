import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import AppointmentList from '../../components/appointments/AppointmentList';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../hooks/useAppointments';
import { AppointmentStatus } from '../../types/appointment';

// Placeholder for the AppointmentCalendar component
const AppointmentCalendar = () => {
  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, minHeight: '400px' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Calendar View
      </Typography>
      <Box sx={{ 
        p: 3, 
        border: '1px dashed grey', 
        borderRadius: 1, 
        height: '350px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography color="text.secondary">
          Calendar integration coming soon. Please use the list view for now.
        </Typography>
      </Box>
    </Box>
  );
};

// Mock appointment data
const mockAppointments: Appointment[] = [
  // ... existing code ...
];

const PatientAppointments: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" mb={3}>My Appointments</Typography>
      <Typography variant="h6" mb={2}>Upcoming Appointments</Typography>
      <AppointmentList
        role="patient"
        filters={{ status: ['confirmed'] }}
      />
    </Container>
  );
};

export default PatientAppointments; 