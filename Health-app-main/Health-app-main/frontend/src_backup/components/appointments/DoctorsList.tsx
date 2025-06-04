import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Box
} from '@mui/material';
import { LocalHospital as DoctorIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { Doctor } from '../../types/doctor';

interface DoctorsListProps {
  onSelectDoctor: (doctor: Doctor) => void;
  selectedDoctorId?: string;
}

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    firstName: string;
    lastName: string;
    specialization?: string;
    licenseNumber?: string;
    role: string;
  };
}

const transformDoctorData = (doctor: SupabaseUser): Doctor => ({
  id: doctor.id,
  email: doctor.email,
  user_metadata: {
    full_name: `${doctor.user_metadata.firstName} ${doctor.user_metadata.lastName}`,
    firstName: doctor.user_metadata.firstName,
    lastName: doctor.user_metadata.lastName,
    specialization: doctor.user_metadata.specialization || '',
    licenseNumber: doctor.user_metadata.licenseNumber || '',
    role: doctor.user_metadata.role,
    roles: [doctor.user_metadata.role]
  }
});

export default function DoctorsList({ onSelectDoctor, selectedDoctorId }: DoctorsListProps) {
  const { data: doctors = [], isLoading, error } = useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, user_metadata')
        .eq('user_metadata->role', 'DOCTOR');

      if (error) throw error;
      
      return (data as SupabaseUser[] || []).map(transformDoctorData);
    }
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" p={2}>
        Error loading doctors: {error instanceof Error ? error.message : 'Unknown error'}
      </Typography>
    );
  }

  if (doctors.length === 0) {
    return (
      <Typography p={2}>
        No doctors available. Please contact the administrator.
      </Typography>
    );
  }

  return (
    <Paper elevation={2}>
      <List>
        {doctors.map((doctor, index) => (
          <React.Fragment key={doctor.id}>
            <ListItem
              button
              selected={selectedDoctorId === doctor.id}
              onClick={() => onSelectDoctor(doctor)}
            >
              <ListItemIcon>
                <DoctorIcon />
              </ListItemIcon>
              <ListItemText
                primary={doctor.user_metadata.full_name}
                secondary={`${doctor.user_metadata.specialization || 'General'} - License: ${doctor.user_metadata.licenseNumber || 'N/A'}`}
              />
            </ListItem>
            {index < doctors.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
} 