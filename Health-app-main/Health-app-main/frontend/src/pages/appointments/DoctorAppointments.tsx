import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Stack,
  Box
} from '@mui/material';
import { supabase } from '../../services/supabaseClient';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface Appointment {
  id: string;
  patient_id: string;
  title: string;
  reason: string;
  notes: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  patient?: {
    full_name: string;
    email: string;
  };
}

const DoctorAppointments: React.FC = () => {
  const [pending, setPending] = useState<Appointment[]>([]);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Move fetchAppointments outside useEffect so it can be called elsewhere
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in as a doctor.');
      setLoading(false);
      return;
    }
    // Fetch all appointments for this doctor
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patient:patient_id(full_name, email)')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setPending([]);
      setUpcoming([]);
    } else {
      // Debug log: print all fetched appointments and their statuses
      console.log('Fetched appointments:', data);
      const now = new Date();
      setPending((data || []).filter(app => app.status === 'pending'));
      setUpcoming((data || []).filter(app =>
        app.status === 'confirmed'
      ));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAction = async (id: string, action: 'accepted' | 'rejected') => {
    setActionLoading(id + action);
    setError(null);
    // Find the appointment in pending list
    const appointment = pending.find(app => app.id === id);
    if (action === 'accepted' && (!appointment || appointment.status !== 'pending')) {
      setError('Only pending appointments can be accepted.');
      setActionLoading(null);
      return;
    }
    // Map action to correct status value (lowercase for DB constraint)
    const status = action === 'accepted' ? 'confirmed' : 'cancelled';
    const { error, data } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select();
    console.log('Update result:', { error, data, id, status });
    if (error) {
      setError(error.message);
    } else {
      // Instead of updating local state, refetch from backend
      await fetchAppointments();
    }
    setActionLoading(null);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 8, p: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary.main">
        <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} /> Doctor Appointments
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* Pending Requests Section */}
          <Typography variant="h5" mt={2} mb={1} sx={{ color: 'primary.main', fontWeight: 600 }}>
            <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} /> Pending Requests
          </Typography>
          <Divider sx={{ mb: 2, bgcolor: '#a78bfa' }} />
          {pending.length === 0 ? (
            <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={180}>
              <Typography>No pending appointment requests.</Typography>
            </Box>
          ) : (
            <Grid container spacing={3} mb={4}>
              {pending.map(app => (
                <Grid item xs={12} sm={12} md={6} key={app.id}>
                  <Card elevation={4} sx={{ borderLeft: '6px solid #a78bfa', borderRadius: 3, bgcolor: '#fff' }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Avatar sx={{ bgcolor: '#a78bfa', color: '#fff' }}><PersonIcon /></Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="primary.main">{app.title}</Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Patient: <b>{app.patient?.full_name || app.patient_id}</b> ({app.patient?.email || 'N/A'})
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography mb={1}><DescriptionIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle', color: '#a78bfa' }} /> <b>Reason:</b> {app.reason}</Typography>
                      <Typography mb={1}><b>Notes:</b> {app.notes}</Typography>
                      <Typography mb={1}><AccessTimeIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle', color: '#a78bfa' }} /> <b>Start:</b> {new Date(app.start_time).toLocaleString()}</Typography>
                      <Typography mb={1}><b>End:</b> {new Date(app.end_time).toLocaleString()}</Typography>
                      <Chip label={app.status} sx={{ fontWeight: 600, textTransform: 'capitalize', mb: 2, bgcolor: '#ede9fe', color: '#7c3aed' }} />
                      <Stack direction="row" spacing={2} mt={2}>
                        <Tooltip title="Accept Appointment">
                          <span>
                            <Button
                              variant="contained"
                              sx={{ bgcolor: '#7c3aed', color: '#fff', minWidth: 120, '&:hover': { bgcolor: '#6d28d9' } }}
                              startIcon={<CheckCircleIcon sx={{ color: '#fff' }} />}
                              disabled={!!actionLoading}
                              onClick={() => handleAction(app.id, 'accepted')}
                            >
                              {actionLoading === app.id + 'accepted' ? <CircularProgress size={20} color="inherit" /> : 'Accept'}
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title="Reject Appointment">
                          <span>
                            <Button
                              variant="outlined"
                              sx={{ borderColor: '#a78bfa', color: '#7c3aed', minWidth: 120, '&:hover': { borderColor: '#7c3aed', bgcolor: '#ede9fe' } }}
                              startIcon={<CancelIcon sx={{ color: '#7c3aed' }} />}
                              disabled={!!actionLoading}
                              onClick={() => handleAction(app.id, 'rejected')}
                            >
                              {actionLoading === app.id + 'rejected' ? <CircularProgress size={20} color="primary" /> : 'Reject'}
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Upcoming Appointments Section */}
          <Typography variant="h5" mt={4} mb={1} sx={{ color: 'primary.main', fontWeight: 600 }}>
            <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} /> Upcoming Appointments
          </Typography>
          <Divider sx={{ mb: 2, bgcolor: '#a78bfa' }} />
          {upcoming.length === 0 ? (
            <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={180}>
              <Typography>No upcoming appointments</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {upcoming.map(app => (
                <Grid item xs={12} sm={12} md={6} key={app.id}>
                  <Card elevation={3} sx={{ borderLeft: '6px solid #a78bfa', borderRadius: 3, bgcolor: '#fff' }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Avatar sx={{ bgcolor: '#a78bfa', color: '#fff' }}><PersonIcon /></Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="primary.main">{app.title}</Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Patient: <b>{app.patient?.full_name || app.patient_id}</b> ({app.patient?.email || 'N/A'})
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography mb={1}><DescriptionIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle', color: '#a78bfa' }} /> <b>Reason:</b> {app.reason}</Typography>
                      <Typography mb={1}><b>Notes:</b> {app.notes}</Typography>
                      <Typography mb={1}><AccessTimeIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle', color: '#a78bfa' }} /> <b>Start:</b> {new Date(app.start_time).toLocaleString()}</Typography>
                      <Typography mb={1}><b>End:</b> {new Date(app.end_time).toLocaleString()}</Typography>
                      <Chip label={app.status} sx={{ fontWeight: 600, textTransform: 'capitalize', mb: 2, bgcolor: '#ede9fe', color: '#7c3aed' }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default DoctorAppointments; 