import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import { Doctor } from '../../types/doctor';

interface DoctorsListProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

export default function DoctorsList({ onSelectDoctor }: DoctorsListProps) {
  const { data: doctors = [], isLoading, error } = useQuery<Doctor[]>(
    'doctors',
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_metadata->>role', 'DOCTOR');

      if (error) throw error;
      return (data || []) as Doctor[];
    }
  );

  if (isLoading) {
    return (
      <Typography p={2}>
        Loading doctors...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography color="error" p={2}>
        Error loading doctors: {(error as Error).message}
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
        {doctors.map((doctor: Doctor, index: number) => (
          <React.Fragment key={doctor.id}>
            <ListItem
              button
              onClick={() => onSelectDoctor(doctor)}
            >
              <ListItemText
                primary={doctor.user_metadata.full_name}
                secondary={doctor.user_metadata.specialization || 'General Practice'}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => onSelectDoctor(doctor)}
                >
                  <CalendarToday />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < doctors.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
} 