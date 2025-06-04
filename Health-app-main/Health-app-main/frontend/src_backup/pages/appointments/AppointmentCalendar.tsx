import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  ButtonGroup,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  CalendarViewWeek as CalendarViewWeekIcon,
  CalendarViewDay as CalendarViewDayIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { format } from 'date-fns';
import { useAppointments } from '../../hooks/useAppointments';

// Define appointment status colors
const statusColors: Record<string, string> = {
  SCHEDULED: '#2196f3', // Blue
  CONFIRMED: '#4caf50', // Green
  COMPLETED: '#9e9e9e', // Gray
  CANCELLED: '#f44336', // Red
  NO_SHOW: '#ff9800', // Orange
  RESCHEDULED: '#673ab7' // Purple
};

// Define appointment type icons
const typeIcons: Record<string, React.ReactNode> = {
  IN_PERSON: '👨‍⚕️',
  VIRTUAL: '🖥️',
  PHONE: '📞'
};

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

const AppointmentCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>('dayGridMonth');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const { appointments, loading, error } = useAppointments();
  
  // Convert appointments to calendar events
  const events: EventInput[] = appointments?.map(appointment => {
    const status = appointment.status || 'SCHEDULED';
    const type = appointment.type || 'IN_PERSON';
    
    return {
      id: appointment.id,
      title: appointment.title,
      start: appointment.startTime,
      end: appointment.endTime,
      backgroundColor: statusColors[status],
      borderColor: statusColors[status],
      textColor: '#ffffff',
      extendedProps: {
        doctor: appointment.doctor?.name || 'Unknown Doctor',
        status,
        type,
        reason: appointment.reason,
        location: appointment.location
      }
    };
  }) || [];
  
  const handleEventClick = (clickInfo: EventClickArg) => {
    navigate(`/appointments/${clickInfo.event.id}`);
  };
  
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    navigate('/appointments/new', { 
      state: { 
        startTime: selectInfo.startStr,
        endTime: selectInfo.endStr
      } 
    });
  };
  
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading appointments: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography variant="h5" component="h1">
          Appointments Calendar
        </Typography>
        
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <ButtonGroup size="small" aria-label="view options">
            <Tooltip title="Month view">
              <Button 
                variant={currentView === 'dayGridMonth' ? 'contained' : 'outlined'} 
                onClick={() => handleViewChange('dayGridMonth')}
                startIcon={<CalendarViewMonthIcon />}
              >
                Month
              </Button>
            </Tooltip>
            <Tooltip title="Week view">
              <Button 
                variant={currentView === 'timeGridWeek' ? 'contained' : 'outlined'} 
                onClick={() => handleViewChange('timeGridWeek')}
                startIcon={<CalendarViewWeekIcon />}
              >
                Week
              </Button>
            </Tooltip>
            <Tooltip title="Day view">
              <Button 
                variant={currentView === 'timeGridDay' ? 'contained' : 'outlined'} 
                onClick={() => handleViewChange('timeGridDay')}
                startIcon={<CalendarViewDayIcon />}
              >
                Day
              </Button>
            </Tooltip>
          </ButtonGroup>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/new')}
          >
            New Appointment
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => {
              const calendarApi = document.querySelector('.fc')?.querySelector('.fc-toolbar-chunk:first-child')?.querySelector('button');
              if (calendarApi) {
                (calendarApi as HTMLButtonElement).click();
              }
            }}>
              <ChevronLeftIcon />
            </IconButton>
            
            <Typography variant="h6">
              {format(currentDate, currentView === 'dayGridMonth' ? 'MMMM yyyy' : 'MMM d, yyyy')}
            </Typography>
            
            <IconButton onClick={() => {
              const calendarApi = document.querySelector('.fc')?.querySelector('.fc-toolbar-chunk:first-child')?.querySelector('button:nth-child(2)');
              if (calendarApi) {
                (calendarApi as HTMLButtonElement).click();
              }
            }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          
          <Button
            size="small"
            startIcon={<TodayIcon />}
            onClick={handleToday}
          >
            Today
          </Button>
        </Box>
        
        <Box sx={{ '.fc': { fontFamily: 'inherit' } }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={false}
            events={events}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            initialDate={currentDate}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={(eventInfo) => {
              const type = eventInfo.event.extendedProps.type as keyof typeof typeIcons;
              const doctor = eventInfo.event.extendedProps.doctor as string;
              
              return (
                <Box sx={{ 
                  p: 0.5, 
                  fontSize: '0.8rem', 
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    mb: 0.5,
                    fontWeight: 'bold'
                  }}>
                    <span>{typeIcons[type]}</span>
                    <span>{eventInfo.event.title}</span>
                  </Box>
                  <Typography variant="caption" component="div" sx={{ opacity: 0.8 }}>
                    {doctor}
                  </Typography>
                </Box>
              );
            }}
            datesSet={(dateInfo) => {
              setCurrentDate(dateInfo.view.currentStart);
            }}
            height="auto"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '08:00',
              endTime: '18:00',
            }}
          />
        </Box>
      </Paper>
      
      <Box mt={3} display="flex" flexWrap="wrap" gap={1}>
        <Typography variant="subtitle2" sx={{ mr: 1, alignSelf: 'center' }}>Legend:</Typography>
        {Object.entries(statusColors).map(([status, color]) => (
          <Chip 
            key={status}
            label={status.replace('_', ' ')}
            sx={{ 
              backgroundColor: color,
              color: 'white',
              '& .MuiChip-label': { px: 1 }
            }}
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

export default AppointmentCalendar; 