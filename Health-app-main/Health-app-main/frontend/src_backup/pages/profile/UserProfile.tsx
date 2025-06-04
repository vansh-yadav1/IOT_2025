import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardActions,
  TextField,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  LocalHospital as HospitalIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  MedicalInformation as MedicalIcon,
  Settings as SettingsIcon,
  FileUpload as UploadIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Mock user data
const userData = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  birthDate: '1985-06-12',
  gender: 'Male',
  address: {
    street: '123 Main Street',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
    country: 'USA'
  },
  insurance: {
    provider: 'HealthPlus Insurance',
    policyNumber: 'HP-12345678',
    groupNumber: 'GP-9876',
    validUntil: '2024-12-31'
  },
  primaryDoctor: 'Dr. Jane Smith',
  emergencyContact: {
    name: 'Sarah Doe',
    relationship: 'Spouse',
    phone: '+1 (555) 987-6543'
  }
};

const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // In a real app, this would send data to an API
    console.log('Updated user data:', formData);
    
    // Update mock user data
    Object.assign(userData, formData);
    
    // Exit edit mode
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone
    });
    
    // Exit edit mode
    setIsEditing(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {userData.firstName} {userData.lastName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Patient ID: {userData.id.toString().padStart(7, '0')}
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<UploadIcon />}
              >
                Change Photo
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quick Links
            </Typography>
            
            <List disablePadding>
              <ListItem 
                component={Link} 
                to="/profile/medical"
                button
                sx={{ 
                  py: 1, 
                  borderRadius: 1,
                  color: 'inherit',
                  textDecoration: 'none'
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <MedicalIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Medical Profile" />
              </ListItem>
              
              <ListItem 
                component={Link} 
                to="/health-metrics"
                button
                sx={{ 
                  py: 1, 
                  borderRadius: 1,
                  color: 'inherit',
                  textDecoration: 'none'
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <HospitalIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Health Metrics" />
              </ListItem>
              
              <ListItem 
                component={Link} 
                to="/profile/settings"
                button
                sx={{ 
                  py: 1, 
                  borderRadius: 1,
                  color: 'inherit',
                  textDecoration: 'none'
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <SettingsIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Account Settings" />
              </ListItem>
              
              <ListItem 
                component={Link} 
                to="/profile/security"
                button
                sx={{ 
                  py: 1, 
                  borderRadius: 1,
                  color: 'inherit',
                  textDecoration: 'none'
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Privacy & Security" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Personal Information
                      </Typography>
                    </Box>
                    
                    {!isEditing && (
                      <Button 
                        startIcon={<EditIcon />} 
                        onClick={() => setIsEditing(true)}
                        size="small"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                  
                  {isEditing ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <List dense disablePadding>
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <EmailIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Email Address" 
                              secondary={userData.email}
                            />
                          </ListItem>
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <PhoneIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Phone Number" 
                              secondary={userData.phone}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <List dense disablePadding>
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CalendarIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Date of Birth" 
                              secondary={new Date(userData.birthDate).toLocaleDateString()}
                            />
                          </ListItem>
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Gender" 
                              secondary={userData.gender}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
                
                {isEditing && (
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button onClick={handleCancel} sx={{ mr: 1 }}>
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSubmit}
                    >
                      Save Changes
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
            
            {/* Address Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <HomeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Address
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {userData.address.street}
                      </Typography>
                      <Typography variant="body1">
                        {userData.address.city}, {userData.address.state} {userData.address.zipCode}
                      </Typography>
                      <Typography variant="body1">
                        {userData.address.country}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button size="small" startIcon={<EditIcon />}>
                    Update Address
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* Insurance Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <HospitalIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Insurance Information
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Provider
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {userData.insurance.provider}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                        Policy Number
                      </Typography>
                      <Typography variant="body1">
                        {userData.insurance.policyNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Group Number
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {userData.insurance.groupNumber}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                        Valid Until
                      </Typography>
                      <Typography variant="body1">
                        {new Date(userData.insurance.validUntil).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button size="small" startIcon={<EditIcon />}>
                    Update Insurance
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PhoneIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Emergency Contact
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {userData.emergencyContact.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Relationship
                      </Typography>
                      <Typography variant="body1">
                        {userData.emergencyContact.relationship}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {userData.emergencyContact.phone}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button size="small" startIcon={<EditIcon />}>
                    Update Contact
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile; 