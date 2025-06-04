import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  ListItemSecondaryAction,
  Avatar, 
  Chip, 
  IconButton,
  Divider,
  Button,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Badge,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  MobileFriendly as MobileIcon,
  Healing as HealingIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  NotificationsActive as AlertIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as ReadIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';

interface Notification {
  id: number;
  type: 'appointment' | 'health' | 'system' | 'message';
  title: string;
  message: string;
  date: string;
  read: boolean;
  urgent?: boolean;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'You have a doctor appointment with Dr. Smith tomorrow at 10:00 AM',
    date: '2023-08-15 09:30',
    read: false,
    urgent: true
  },
  {
    id: 2,
    type: 'health',
    title: 'Blood Pressure Alert',
    message: 'Your blood pressure reading is higher than normal. Consider consulting your doctor.',
    date: '2023-08-14 14:45',
    read: true,
    urgent: true
  },
  {
    id: 3,
    type: 'system',
    title: 'Password Changed',
    message: 'Your account password was changed successfully.',
    date: '2023-08-12 11:20',
    read: true
  },
  {
    id: 4,
    type: 'message',
    title: 'New Message from Dr. Johnson',
    message: 'Please review your recent lab results and contact me if you have any questions.',
    date: '2023-08-10 16:05',
    read: false
  },
  {
    id: 5,
    type: 'health',
    title: 'Medication Reminder',
    message: 'Don\'t forget to take your evening medication.',
    date: '2023-08-08 19:00',
    read: true
  },
  {
    id: 6,
    type: 'appointment',
    title: 'Appointment Rescheduled',
    message: 'Your appointment with Dr. Wilson has been rescheduled to Friday, August 18 at 2:30 PM.',
    date: '2023-08-07 13:15',
    read: false
  },
  {
    id: 7,
    type: 'system',
    title: 'Account Security',
    message: 'We noticed a login from a new device. If this wasn\'t you, please secure your account immediately.',
    date: '2023-08-05 08:30',
    read: true,
    urgent: true
  }
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [tabValue, setTabValue] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    appointmentReminders: true,
    healthAlerts: true,
    systemUpdates: true,
    marketingMessages: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [selectedNotification, setSelectedNotification] = useState<number | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  useEffect(() => {
    // This would be an API call in a real application
    // Just using the mock data for demonstration
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
    
    setSnackbar({
      open: true,
      message: `${name} notifications ${checked ? 'enabled' : 'disabled'}`,
      severity: 'success'
    });
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    setSnackbar({
      open: true,
      message: 'Notification deleted',
      severity: 'success'
    });
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setSnackbar({
      open: true,
      message: 'All notifications marked as read',
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(id);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
    handleFilterClose();
  };

  const getFilteredNotifications = () => {
    let filtered = [...notifications];
    
    // Apply tab filters
    if (tabValue === 1) {
      filtered = filtered.filter(n => !n.read);
    } else if (tabValue === 2) {
      filtered = filtered.filter(n => n.read);
    }
    
    // Apply type filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(n => activeFilters.includes(n.type));
    }
    
    return filtered;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon color="primary" />;
      case 'health':
        return <HealingIcon color="error" />;
      case 'message':
        return <EmailIcon color="info" />;
      case 'system':
        return <SettingsIcon color="action" />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">
          Notifications
          {unreadCount > 0 && (
            <Badge 
              badgeContent={unreadCount} 
              color="primary" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        
        <Box>
          <Tooltip title="Filter notifications">
            <IconButton onClick={handleFilterOpen}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilterToggle('appointment')}>
              <CalendarIcon fontSize="small" sx={{ mr: 1 }} /> 
              Appointments
            </MenuItem>
            <MenuItem onClick={() => handleFilterToggle('health')}>
              <HealingIcon fontSize="small" sx={{ mr: 1 }} /> 
              Health Alerts
            </MenuItem>
            <MenuItem onClick={() => handleFilterToggle('message')}>
              <EmailIcon fontSize="small" sx={{ mr: 1 }} /> 
              Messages
            </MenuItem>
            <MenuItem onClick={() => handleFilterToggle('system')}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} /> 
              System
            </MenuItem>
          </Menu>
          
          {activeFilters.length > 0 && (
            <Chip 
              label={`${activeFilters.length} filters active`}
              onDelete={() => setActiveFilters([])}
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="All" />
              <Tab 
                label={
                  <Badge badgeContent={unreadCount} color="error">
                    Unread
                  </Badge>
                } 
                disabled={unreadCount === 0}
              />
              <Tab label="Read" />
            </Tabs>
            
            <Box p={2} display="flex" justifyContent="flex-end">
              <Button 
                size="small" 
                onClick={handleMarkAllRead}
                startIcon={<ReadIcon />}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </Box>
            
            <Divider />
            
            <List sx={{ py: 0 }}>
              {getFilteredNotifications().length === 0 ? (
                <Box p={4} textAlign="center">
                  <NotificationsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography color="textSecondary">
                    No notifications to display
                  </Typography>
                </Box>
              ) : (
                getFilteredNotifications().map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem 
                      alignItems="flex-start"
                      onClick={() => handleNotificationClick(notification.id)}
                      sx={{ 
                        bgcolor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.05)',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: notification.urgent ? 'error.light' : 'primary.light',
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography 
                              variant="subtitle1" 
                              fontWeight={notification.read ? 'normal' : 'bold'}
                            >
                              {notification.title}
                            </Typography>
                            {notification.urgent && (
                              <Chip 
                                label="Urgent" 
                                size="small" 
                                color="error" 
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="textPrimary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                              {notification.date}
                            </Typography>
                          </>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="more options"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, notification.id);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Notification Settings
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Delivery Methods
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <EmailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive notifications via email"
                />
                <Switch
                  edge="end"
                  name="email"
                  checked={notificationSettings.email}
                  onChange={handleSettingChange}
                />
              </ListItem>
              
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <NotificationsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Push Notifications" 
                  secondary="Receive notifications on your device"
                />
                <Switch
                  edge="end"
                  name="push"
                  checked={notificationSettings.push}
                  onChange={handleSettingChange}
                />
              </ListItem>
              
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.light' }}>
                    <MobileIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="SMS Notifications" 
                  secondary="Receive notifications via text message"
                />
                <Switch
                  edge="end"
                  name="sms"
                  checked={notificationSettings.sms}
                  onChange={handleSettingChange}
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Notification Types
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <CalendarIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Appointment Reminders" 
                  secondary="Upcoming appointments and scheduling changes"
                />
                <Switch
                  edge="end"
                  name="appointmentReminders"
                  checked={notificationSettings.appointmentReminders}
                  onChange={handleSettingChange}
                />
              </ListItem>
              
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    <HealingIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Health Alerts" 
                  secondary="Important updates about your health metrics"
                />
                <Switch
                  edge="end"
                  name="healthAlerts"
                  checked={notificationSettings.healthAlerts}
                  onChange={handleSettingChange}
                />
              </ListItem>
              
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <SettingsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="System Updates" 
                  secondary="Security and account-related notifications"
                />
                <Switch
                  edge="end"
                  name="systemUpdates"
                  checked={notificationSettings.systemUpdates}
                  onChange={handleSettingChange}
                />
              </ListItem>
              
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'grey.400' }}>
                    <AnalyticsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Marketing Messages" 
                  secondary="Updates about new features and services"
                />
                <Switch
                  edge="end"
                  name="marketingMessages"
                  checked={notificationSettings.marketingMessages}
                  onChange={handleSettingChange}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Menu for notification actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedNotification) {
            const notification = notifications.find(n => n.id === selectedNotification);
            if (notification) {
              handleNotificationClick(selectedNotification);
              setNotifications(prev => 
                prev.map(n => 
                  n.id === selectedNotification ? { ...n, read: !n.read } : n
                )
              );
            }
          }
          handleMenuClose();
        }}>
          <ReadIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as {notifications.find(n => n.id === selectedNotification)?.read ? 'unread' : 'read'}
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedNotification) {
            handleDeleteNotification(selectedNotification);
          }
          handleMenuClose();
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NotificationsPage; 