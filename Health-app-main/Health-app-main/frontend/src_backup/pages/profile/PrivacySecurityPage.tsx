import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  DataUsage as DataUsageIcon,
  History as HistoryIcon,
  VerifiedUser as VerifiedUserIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Mock session data
const sessionData = [
  { id: 1, device: 'Chrome on Windows', location: 'New York, USA', lastActive: '2023-08-15 14:32', current: true },
  { id: 2, device: 'Safari on iPhone', location: 'Boston, USA', lastActive: '2023-08-14 09:15', current: false },
  { id: 3, device: 'Firefox on MacOS', location: 'Seattle, USA', lastActive: '2023-08-10 17:45', current: false }
];

// Mock data activities
const dataActivities = [
  { id: 1, activity: 'Health data updated', date: '2023-08-15 10:30', details: 'Blood pressure reading added' },
  { id: 2, activity: 'Profile information changed', date: '2023-08-14 09:15', details: 'Updated contact information' },
  { id: 3, activity: 'Login from new device', date: '2023-08-10 17:45', details: 'Safari on iPhone' },
  { id: 4, activity: 'Data export requested', date: '2023-08-05 14:30', details: 'Full account data export' },
  { id: 5, activity: 'Privacy settings changed', date: '2023-07-30 11:20', details: 'Modified data sharing preferences' }
];

const PrivacySecurityPage: React.FC = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    rememberDevices: true,
    dataEncryption: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    cookieUsage: true,
    analytics: true
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'twoFactor' | 'terminateSession' | 'delete'>('twoFactor');
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [alertMessage, setAlertMessage] = useState({ show: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSecurityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    
    if (name === 'twoFactorAuth' && checked) {
      // Open 2FA setup dialog
      setDialogType('twoFactor');
      setOpenDialog(true);
      return;
    }
    
    setSecuritySettings(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Show alert on security setting change
    setAlertMessage({
      show: true,
      message: `Security setting "${name}" has been ${checked ? 'enabled' : 'disabled'}`,
      severity: 'success'
    });
    
    setTimeout(() => setAlertMessage(prev => ({ ...prev, show: false })), 3000);
  };

  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Show alert on privacy setting change
    setAlertMessage({
      show: true,
      message: `Privacy setting "${name}" has been ${checked ? 'enabled' : 'disabled'}`,
      severity: 'success'
    });
    
    setTimeout(() => setAlertMessage(prev => ({ ...prev, show: false })), 3000);
  };

  const handleTerminateSession = (sessionId: number) => {
    setSelectedSession(sessionId);
    setDialogType('terminateSession');
    setOpenDialog(true);
  };

  const handleDeleteAccountRequest = () => {
    setDialogType('delete');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setVerificationCode('');
  };

  const handleDialogConfirm = () => {
    switch (dialogType) {
      case 'twoFactor':
        // In a real app, would verify code and enable 2FA
        if (verificationCode.length === 6) {
          setSecuritySettings(prev => ({ ...prev, twoFactorAuth: true }));
          setAlertMessage({
            show: true,
            message: 'Two-factor authentication has been enabled',
            severity: 'success'
          });
        } else {
          setAlertMessage({
            show: true,
            message: 'Invalid verification code',
            severity: 'error'
          });
        }
        break;
        
      case 'terminateSession':
        // In a real app, would terminate the selected session
        setAlertMessage({
          show: true,
          message: 'Session has been terminated',
          severity: 'success'
        });
        break;
        
      case 'delete':
        // In a real app, would initiate account deletion process
        setAlertMessage({
          show: true,
          message: 'Account deletion process has been initiated. Check your email for confirmation.',
          severity: 'success'
        });
        break;
    }
    
    setTimeout(() => setAlertMessage(prev => ({ ...prev, show: false })), 3000);
    handleCloseDialog();
  };

  const handleDownloadData = () => {
    // In a real app, would initiate data download process
    setAlertMessage({
      show: true,
      message: 'Your data is being prepared for download. You will receive an email when it\'s ready.',
      severity: 'success'
    });
    
    setTimeout(() => setAlertMessage(prev => ({ ...prev, show: false })), 5000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {alertMessage.show && (
        <Alert 
          severity={alertMessage.severity}
          sx={{ mb: 3 }}
          onClose={() => setAlertMessage(prev => ({ ...prev, show: false }))}
        >
          {alertMessage.message}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom>
        Privacy & Security
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage your data privacy preferences and security settings
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {/* Security Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Security Settings
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Two-Factor Authentication" 
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onChange={handleSecurityChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Login Notifications" 
                  secondary="Get alerted when someone logs into your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="loginNotifications"
                    checked={securitySettings.loginNotifications}
                    onChange={handleSecurityChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Remember Devices" 
                  secondary="Stay logged in on frequently used devices"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="rememberDevices"
                    checked={securitySettings.rememberDevices}
                    onChange={handleSecurityChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Enhanced Data Encryption" 
                  secondary="Use additional encryption for sensitive health data"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="dataEncryption"
                    checked={securitySettings.dataEncryption}
                    onChange={handleSecurityChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
          
          {/* Active Sessions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <HistoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Active Sessions
              </Typography>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Device</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessionData.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {session.device}
                          {session.current && (
                            <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                              (Current)
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{session.location}</TableCell>
                      <TableCell>{session.lastActive}</TableCell>
                      <TableCell align="right">
                        {!session.current && (
                          <Button 
                            size="small" 
                            color="secondary"
                            onClick={() => handleTerminateSession(session.id)}
                          >
                            Terminate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          {/* Privacy Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <VisibilityOffIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Privacy Settings
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Data Sharing" 
                  secondary="Allow sharing anonymized health data for research"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="dataSharing"
                    checked={privacySettings.dataSharing}
                    onChange={handlePrivacyChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Cookie Usage" 
                  secondary="Allow cookies to remember your preferences"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="cookieUsage"
                    checked={privacySettings.cookieUsage}
                    onChange={handlePrivacyChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Usage Analytics" 
                  secondary="Help us improve by sharing anonymous usage data"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="analytics"
                    checked={privacySettings.analytics}
                    onChange={handlePrivacyChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
          
          {/* Data Access & Control */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <DataUsageIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Data Access & Control
              </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Button 
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  fullWidth
                  onClick={handleDownloadData}
                >
                  Download Your Data
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={handleDeleteAccountRequest}
                >
                  Request Account Deletion
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Activity History */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <HistoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Recent Account Activity
              </Typography>
            </Box>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>View Activity History</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {dataActivities.map(activity => (
                    <ListItem key={activity.id} divider>
                      <ListItemText
                        primary={activity.activity}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {activity.date}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="textSecondary">
                              {activity.details}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialogs */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {dialogType === 'twoFactor' && (
          <>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Enter the 6-digit verification code sent to your phone to enable two-factor authentication.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Verification Code"
                type="text"
                fullWidth
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
              />
            </DialogContent>
          </>
        )}
        
        {dialogType === 'terminateSession' && (
          <>
            <DialogTitle>Terminate Session</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to terminate this session? This will log out the device immediately.
              </DialogContentText>
            </DialogContent>
          </>
        )}
        
        {dialogType === 'delete' && (
          <>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to request account deletion? This process will:
              </DialogContentText>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Remove all your personal information from our systems" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Delete your health records and metrics" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Cancel any scheduled appointments" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Terminate all active sessions" />
                </ListItem>
              </List>
              <DialogContentText sx={{ mt: 2, color: 'error.main' }}>
                This action cannot be undone.
              </DialogContentText>
            </DialogContent>
          </>
        )}
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDialogConfirm} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PrivacySecurityPage; 