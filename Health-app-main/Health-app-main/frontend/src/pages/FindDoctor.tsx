import React from 'react';
import DoctorMap from '../components/DoctorMap';
import { Paper, Typography, Box } from '@mui/material';

const FindDoctor: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor="#f5f4fa">
      <Paper elevation={4} sx={{ p: 3, borderRadius: 4, minWidth: 360, maxWidth: 900, width: '100%', boxShadow: '0 8px 32px rgba(124,58,237,0.12)' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#7c3aed', fontWeight: 700 }}>
          Find Doctors Near Me
        </Typography>
        <Box mt={2}>
          <DoctorMap />
        </Box>
      </Paper>
    </Box>
  );
};

export default FindDoctor; 