import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { fetchAllPatients } from '../../services/doctorService';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const PatientPortal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hiddenPatientIds, setHiddenPatientIds] = useState<string[]>([]);

  // Load hiddenPatientIds from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('hiddenPatientIds');
    if (stored) {
      setHiddenPatientIds(JSON.parse(stored));
    }
  }, []);

  // Soft delete (hide from table)
  const handleHidePatient = (patientId: string) => {
    setHiddenPatientIds((prev) => {
      const updated = [...prev, patientId];
      localStorage.setItem('hiddenPatientIds', JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch patients for this doctor
  const { data: patients, isLoading, error } = useQuery(['patients'], fetchAllPatients, {
    enabled: !!user,
    onError: (error) => {
      console.error('Error fetching patients:', error);
    }
  });

  // Filter patients for the table (exclude hidden)
  const filteredPatients = (patients || []).filter(
    (patient: any) => !hiddenPatientIds.includes(patient.id)
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>My Patients</Typography>
      <Autocomplete
        options={patients || []}
        getOptionLabel={(option) => option.full_name || ''}
        value={null}
        onChange={(_, value) => {
          if (value) {
            setHiddenPatientIds((prev) => {
              const updated = prev.filter((id) => id !== value.id);
              localStorage.setItem('hiddenPatientIds', JSON.stringify(updated));
              return updated;
            });
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select patient"
            variant="outlined"
            sx={{ mb: 2, maxWidth: 400 }}
          />
        )}
        sx={{ mb: 2, maxWidth: 400 }}
      />
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">Failed to load patients.</Typography>
      ) : patients && patients.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient: any) => (
                <TableRow key={patient.id} hover>
                  <TableCell>{patient.full_name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Button variant="outlined" size="small" onClick={() => navigate(`/patients/${patient.id}?email=${encodeURIComponent(patient.email)}`)}>
                        View Details
                      </Button>
                      <Box ml={8} />
                      <DeleteIcon
                        style={{ color: 'red', cursor: 'pointer' }}
                        onClick={() => handleHidePatient(patient.id)}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No patients found.</Typography>
      )}
    </Box>
  );
};

export default PatientPortal; 