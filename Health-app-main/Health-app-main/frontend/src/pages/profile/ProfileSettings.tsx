import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  DisplaySettings as DisplayIcon,
  Sync as SyncIcon,
  AccessTime as TimeIcon,
  Lock as LockIcon,
  DeleteForever as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Mock settings data
const initialSettings = {
  notifications: {
    email: true,
    sms: false,
    push: true,
    appUpdates: true,
    healthReminders: true,
    appointmentReminders: true
  },
  display: {
    darkMode: false,
    highContrast: false,
    fontSize: 'medium'
  },
  privacy: {
    shareData: false,
    anonymousAnalytics: true
  },
  language: 'en',
  timeZone: 'America/New_York'
};

const fontSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' }
];

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' }
];

const ProfileSettings: React.FC = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [saveStatus, setSaveStatus] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked
      }
    }));
  };

  const handleDisplayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [name]: checked
      }
    }));
  };

  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [name]: checked
      }
    }));
  };

  const handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target.name as string;
    const value = event.target.value as string;
    
    if (name === 'fontSize') {
      setSettings(prev => ({
        ...prev,
        display: {
          ...prev.display,
          fontSize: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any previous error when user starts typing again
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSaveSettings = () => {
    // In a real app, this would send data to an API
    console.log('Saving settings:', settings);
    
    // Show success message
    setSaveStatus({
      show: true,
      message: 'Settings saved successfully',
      type: 'success'
    });
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleChangePassword = () => {
    // Simple validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    // In a real app, this would call an API to change the password
    console.log('Changing password...');
    
    // Reset form and show success
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setSaveStatus({
      show: true,
      message: 'Password changed successfully',
      type: 'success'
    });
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    // and then process the account deletion if confirmed
    console.log('Delete account requested');
    
    alert('This is a demo. In a real application, this would delete your account after confirmation.');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {saveStatus.show && (
        <Alert 
          severity={saveStatus.type} 
          sx={{ mb: 3 }}
          onClose={() => setSaveStatus(prev => ({ ...prev, show: false }))}
        >
          {saveStatus.message}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Notification Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Notification Preferences
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive updates and alerts via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="email"
                    checked={settings.notifications.email}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="SMS Notifications" 
                  secondary="Receive text messages for important alerts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="sms"
                    checked={settings.notifications.sms}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Push Notifications" 
                  secondary="Receive notifications on your device"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="push"
                    checked={settings.notifications.push}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="App Updates" 
                  secondary="Get notified about new features and updates"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="appUpdates"
                    checked={settings.notifications.appUpdates}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Health Reminders" 
                  secondary="Receive reminders for health check-ups and tracking"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="healthReminders"
                    checked={settings.notifications.healthReminders}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Appointment Reminders" 
                  secondary="Get notifications about upcoming appointments"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="appointmentReminders"
                    checked={settings.notifications.appointmentReminders}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
          
          {/* Display Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <DisplayIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Display Settings
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Switch between light and dark themes"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="darkMode"
                    checked={settings.display.darkMode}
                    onChange={handleDisplayChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="High Contrast" 
                  secondary="Increase contrast for better readability"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="highContrast"
                    checked={settings.display.highContrast}
                    onChange={handleDisplayChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
                  <ListItemText 
                    primary="Font Size" 
                    secondary="Adjust the text size throughout the app"
                  />
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120, ml: 2 }}>
                    <Select
                      value={settings.display.fontSize}
                      name="fontSize"
                      onChange={handleSelectChange as any}
                    >
                      {fontSizeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </ListItem>
            </List>
          </Paper>
          
          {/* Language and Region */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LanguageIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Language and Region
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="language-select-label">Language</InputLabel>
                  <Select
                    labelId="language-select-label"
                    id="language-select"
                    value={settings.language}
                    name="language"
                    label="Language"
                    onChange={handleSelectChange as any}
                  >
                    {languageOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="timezone-select-label">Time Zone</InputLabel>
                  <Select
                    labelId="timezone-select-label"
                    id="timezone-select"
                    value={settings.timeZone}
                    name="timeZone"
                    label="Time Zone"
                    onChange={handleSelectChange as any}
                  >
                    {timezoneOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Privacy Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LockIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Privacy Settings
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Share Health Data" 
                  secondary="Allow sharing of anonymized health data for research"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="shareData"
                    checked={settings.privacy.shareData}
                    onChange={handlePrivacyChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Anonymous Usage Analytics" 
                  secondary="Help improve the app by sharing anonymous usage data"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="anonymousAnalytics"
                    checked={settings.privacy.anonymousAnalytics}
                    onChange={handlePrivacyChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Password Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
              />
            </CardContent>
            <CardActions>
              <Button 
                color="primary" 
                variant="contained"
                onClick={handleChangePassword}
              >
                Update Password
              </Button>
            </CardActions>
          </Card>
          
          {/* Account Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Danger Zone
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>
                  Delete your account and all your personal data. This action cannot be undone.
                </Typography>
                
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAccount}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfileSettings; 