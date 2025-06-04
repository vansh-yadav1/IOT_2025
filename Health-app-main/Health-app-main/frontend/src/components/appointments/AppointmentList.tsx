import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { Card, CardContent, Chip, Grid, Typography, Box, Avatar } from '@mui/material';
import { CalendarMonth, Person, AccessTime, InfoOutlined } from '@mui/icons-material';

interface AppointmentListProps {
  role: 'patient' | 'doctor';
  onEdit?: (appointment: Appointment) => void;
  filters?: {
    status?: (AppointmentStatus | string)[];
  };
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  role,
  onEdit,
  filters = {}
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user?.id, role, filters]);

  const fetchAppointments = async () => {
    try {
      const params: any = {
        [role === 'patient' ? 'patient_id' : 'doctor_id']: user?.id,
      };

      // Add status filter if provided
      if (filters.status?.length) {
        params.status = filters.status;
      }

      // Debug: log params
      console.log('Fetching appointments with params:', params);

      const data = await appointmentService.getAppointments(params);
      // Debug: log data
      console.log('Fetched appointments data:', data);
      // For patients, filter upcoming appointments: status 'confirmed' (lowercase) and startTime in the future
      if (role === 'patient' && filters.status && filters.status.includes('confirmed')) {
        setAppointments(data.filter(appt => String(appt.status).toLowerCase() === 'confirmed'));
      } else {
        setAppointments(data);
      }
    } catch (error) {
      // Debug: log error
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch appointments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: AppointmentStatus) => {
    try {
      await appointmentService.update(id, { status });
      toast({
        title: 'Success',
        description: 'Appointment status updated successfully',
        variant: 'success',
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await appointmentService.cancel(id);
      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully',
        variant: 'success',
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'secondary';
      case 'NO_SHOW':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderActions = (appointment: Appointment) => {
    const isUpcoming = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status as string);
    
    if (role === 'doctor') {
      return (
        <div className="space-x-2">
          {isUpcoming && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(appointment.id, 'CONFIRMED' as AppointmentStatus)}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED' as AppointmentStatus)}
              >
                Complete
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusUpdate(appointment.id, 'NO_SHOW' as AppointmentStatus)}
              >
                No Show
              </Button>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-x-2">
        {isUpcoming && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(appointment)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCancel(appointment.id)}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No appointments found
      </div>
    );
  }

  // Beautiful card-based UI
  return (
    <Box>
      <Grid container spacing={3}>
        {appointments.map((appointment) => (
          <Grid item xs={12} md={6} key={appointment.id}>
            <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarMonth color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600} mr={2}>
                    {format(new Date(appointment.startTime), 'PPPP p')}
                  </Typography>
                  <Chip
                    label={String(appointment.status).toUpperCase()}
                    color={String(appointment.status).toLowerCase() === 'confirmed' ? 'success' : 'default'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={500} mr={2}>
                    Doctor: {appointment.doctor.name || 'N/A'}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccessTime color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(appointment.startTime), 'p')} - {format(new Date(appointment.endTime), 'p')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <InfoOutlined color="info" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    <b>Reason:</b> {appointment.reason}
                  </Typography>
                </Box>
                {/* Add more details or actions here if needed */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AppointmentList; 