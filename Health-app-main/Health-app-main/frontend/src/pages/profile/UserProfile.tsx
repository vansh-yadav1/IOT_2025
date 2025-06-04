import React, { useState, useEffect } from 'react';
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
  FileUpload as UploadIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { updateDoctor, getDoctor, createDoctor } from '../../services/supabaseService';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const isDoctor = user?.user_metadata?.role === 'DOCTOR';
  // Debug: Print the logged-in user's id and role
  console.log('Logged in user id:', user?.id, 'role:', user?.user_metadata?.role);

  // --- Patient state and handlers (restore for patient profile) ---
  // Only used if !isDoctor
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    photo: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    dob: '',
    gender: '',
    specialty: '',
    qualifications: '',
    languages: '',
    license_number: '',
    years_of_experience: '',
    clinic_affiliation: '',
    office_address: '',
    consultation_hours: ''
  });
  // Address
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  // Insurance
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [insuranceData, setInsuranceData] = useState({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    validUntil: ''
  });
  // Emergency Contact
  const [editingContact, setEditingContact] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    relationship: '',
    phone: ''
  });

  // Doctor edit state and handlers
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);

  // Add separate edit states for each section
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingConsultation, setIsEditingConsultation] = useState(false);

  // Save/cancel handlers for each section
  const handleSavePersonal = async () => {
    await updateDoctorProfile(formData);
    setIsEditingPersonal(false);
  };
  const handleCancelPersonal = () => {
    setIsEditingPersonal(false);
  };
  const handleSaveProfessional = async () => {
    await updateDoctorProfile(formData);
    setIsEditingProfessional(false);
  };
  const handleCancelProfessional = () => {
    setIsEditingProfessional(false);
  };
  const handleSaveConsultation = async () => {
    await updateDoctorProfile(formData);
    setIsEditingConsultation(false);
  };
  const handleCancelConsultation = () => {
    setIsEditingConsultation(false);
  };

  // Load all data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('profileData');
    if (saved) setFormData(JSON.parse(saved));
    const savedAddress = localStorage.getItem('addressData');
    if (savedAddress) setAddressData(JSON.parse(savedAddress));
    const savedInsurance = localStorage.getItem('insuranceData');
    if (savedInsurance) setInsuranceData(JSON.parse(savedInsurance));
    const savedContact = localStorage.getItem('contactData');
    if (savedContact) setContactData(JSON.parse(savedContact));
  }, []);

  // Doctor profile localStorage load
  useEffect(() => {
    if (isDoctor) {
      const saved = localStorage.getItem('doctorProfileData');
      if (saved) setFormData(JSON.parse(saved));
    }
  }, [isDoctor]);

  // Fetch real doctor profile from backend on mount
  useEffect(() => {
    async function fetchDoctorProfile() {
      if (isDoctor && user && user.id) {
        try {
          // Use Supabase directly for fetching doctor profile
          const profile = await getDoctor(user.id);
          setFormData((prev) => ({
            ...prev,
            ...profile
          }));
        } catch (error) {
          console.error('Failed to fetch doctor profile:', error);
        }
      }
    }
    fetchDoctorProfile();
  }, [isDoctor, user]);

  // Ensure doctor row exists in Supabase
  useEffect(() => {
    async function ensureDoctorRow() {
      if (isDoctor && user && user.id) {
        try {
          await getDoctor(user.id);
        } catch (error) {
          // If not found, create a new doctor row with the correct id
          await createDoctor({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.firstName || '',
            last_name: user.user_metadata?.lastName || '',
            // Add any other default fields as needed
          });
        }
      }
    }
    ensureDoctorRow();
  }, [isDoctor, user]);

  // Show loading until user is loaded
  if (!user) {
    return <div>Loading...</div>;
  }

  // Patient handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = () => {
    localStorage.setItem('profileData', JSON.stringify(formData));
    setIsEditing(false);
  };
  const handleCancel = () => {
    const saved = localStorage.getItem('profileData');
    setFormData(saved ? JSON.parse(saved) : {
      photo: '', first_name: '', last_name: '', phone: '', email: '', dob: '', gender: '', specialty: '', qualifications: '', languages: '', license_number: '', years_of_experience: '', clinic_affiliation: '', office_address: '', consultation_hours: ''
    });
    setIsEditing(false);
  };
  // Address handlers
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };
  const handleAddressSave = async () => {
    localStorage.setItem('addressData', JSON.stringify(addressData));
    setEditingAddress(false);
    alert('Address updated successfully!');
  };
  const handleAddressCancel = () => {
    const saved = localStorage.getItem('addressData');
    setAddressData(saved ? JSON.parse(saved) : { street: '', city: '', state: '', zipCode: '', country: '' });
    setEditingAddress(false);
  };
  // Insurance handlers
  const handleInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInsuranceData(prev => ({ ...prev, [name]: value }));
  };
  const handleInsuranceSave = async () => {
    localStorage.setItem('insuranceData', JSON.stringify(insuranceData));
    setEditingInsurance(false);
    alert('Insurance updated successfully!');
  };
  const handleInsuranceCancel = () => {
    const saved = localStorage.getItem('insuranceData');
    setInsuranceData(saved ? JSON.parse(saved) : { provider: '', policyNumber: '', groupNumber: '', validUntil: '' });
    setEditingInsurance(false);
  };
  // Emergency Contact handlers
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };
  const handleContactSave = async () => {
    localStorage.setItem('contactData', JSON.stringify(contactData));
    setEditingContact(false);
    alert('Emergency contact updated successfully!');
  };
  const handleContactCancel = () => {
    const saved = localStorage.getItem('contactData');
    setContactData(saved ? JSON.parse(saved) : { name: '', relationship: '', phone: '' });
    setEditingContact(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        setFormData(prev => ({ ...prev, photo: ev.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Doctor profile handlers
  const handleDoctorEdit = () => {
    setIsEditingDoctor(true);
  };
  const handleDoctorCancel = () => {
    setIsEditingDoctor(false);
  };
  const handleDoctorSubmit = async () => {
    try {
      console.log('Submitting doctor profile:', formData);
      await updateDoctorProfile(formData);
      // Fetch the latest profile after update
      const profile = await getDoctor(user.id);
      setFormData((prev) => ({
        ...prev,
        ...profile
      }));
      setIsEditingDoctor(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Doctor profile update error:', error);
      alert(error.message || JSON.stringify(error));
      throw error;
    }
  };

  // Add default values for patient ID and photo if missing
  const patientId = formData.patientId || '000001';
  const photo = formData.photo || '';
  const avatarInitials = (!photo && (formData.first_name?.charAt(0) || '') + (formData.last_name?.charAt(0) || '')) || 'JD';

  // Add this function to update doctor profile in the backend
  type DoctorProfileData = typeof formData;
  const updateDoctorProfile = async (data: DoctorProfileData) => {
    try {
      if (!user || !user.id) {
        alert('User not logged in!');
        return;
      }
      const allowedFields = [
        'first_name', 'last_name', 'email', 'phone', 'specialty', 'qualifications',
        'languages', 'license_number', 'years_of_experience', 'clinic_affiliation',
        'office_address', 'consultation_hours'
      ];
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([key]) => allowedFields.includes(key))
      );
      // Use Supabase directly for doctor update
      await updateDoctor(user.id, filteredData);
    } catch (error: any) {
      console.error('Failed to update profile!', error);
      alert(error.message || JSON.stringify(error));
      throw error;
    }
  };

  if (!isDoctor) {
    // Patient profile UI
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left column: Profile card and Quick Links */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={photo}
                sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: 48 }}
              >
                {avatarInitials}
              </Avatar>
              <Typography variant="h6" fontWeight={600} align="center" sx={{ mb: 1 }}>
                {formData.first_name || 'John'} {formData.last_name || 'Doe'}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                Patient ID: {patientId}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
              >
                Change Photo
                <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              </Button>
            </Card>
            {/* Quick Links */}
            <Card sx={{ mt: 2, p: 2, boxShadow: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Quick Links</Typography>
              <List>
                <ListItem button component={Link} to="/profile/medical">
                  <ListItemIcon><MedicalIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Medical Profile" />
                </ListItem>
                <ListItem button component={Link} to="/health-metrics">
                  <ListItemIcon><ShowChartIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Health Metrics" />
                </ListItem>
                <ListItem button component={Link} to="/profile/settings">
                  <ListItemIcon><SettingsIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Account Settings" />
                </ListItem>
                <ListItem button component={Link} to="/profile/privacy">
                  <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Privacy & Security" />
                </ListItem>
              </List>
            </Card>
          </Grid>

          {/* Right column: Main Info */}
          <Grid item xs={12} md={8}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Personal Information</Typography>
                  </Box>
                  {isEditing ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} margin="normal" InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Gender" name="gender" value={formData.gender} onChange={handleChange} margin="normal" />
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                        <Typography variant="body1">{formData.first_name || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                        <Typography variant="body1">{formData.last_name || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{formData.email || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1">{formData.phone || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                        <Typography variant="body1">{formData.dob || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                        <Typography variant="body1">{formData.gender || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)} size="small">
                            Edit Profile
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <HomeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Address</Typography>
                  </Box>
                  {editingAddress ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12}><TextField fullWidth label="Street" name="street" value={addressData.street} onChange={handleAddressChange} margin="normal" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="City" name="city" value={addressData.city} onChange={handleAddressChange} margin="normal" /></Grid>
                      <Grid item xs={12} sm={3}><TextField fullWidth label="State" name="state" value={addressData.state} onChange={handleAddressChange} margin="normal" /></Grid>
                      <Grid item xs={12} sm={3}><TextField fullWidth label="Zip Code" name="zipCode" value={addressData.zipCode} onChange={handleAddressChange} margin="normal" /></Grid>
                      <Grid item xs={12}><TextField fullWidth label="Country" name="country" value={addressData.country} onChange={handleAddressChange} margin="normal" /></Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1">{addressData.street || 'Not provided'}</Typography>
                        <Typography variant="body1">{addressData.city || 'Not provided'}, {addressData.state || 'Not provided'} {addressData.zipCode || 'Not provided'}</Typography>
                        <Typography variant="body1">{addressData.country || 'Not provided'}</Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  {editingAddress ? (
                    <>
                      <Button onClick={handleAddressCancel} sx={{ mr: 1 }}>Cancel</Button>
                      <Button variant="contained" color="primary" onClick={handleAddressSave}>Save</Button>
                    </>
                  ) : (
                    <Button size="small" startIcon={<EditIcon />} onClick={() => setEditingAddress(true)}>
                      Update Address
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>

            {/* Insurance Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <HospitalIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Insurance Information</Typography>
                  </Box>
                  {editingInsurance ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Provider" name="provider" value={insuranceData.provider} onChange={handleInsuranceChange} margin="normal" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Group Number" name="groupNumber" value={insuranceData.groupNumber} onChange={handleInsuranceChange} margin="normal" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Policy Number" name="policyNumber" value={insuranceData.policyNumber} onChange={handleInsuranceChange} margin="normal" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Valid Until" name="validUntil" value={insuranceData.validUntil} onChange={handleInsuranceChange} margin="normal" type="date" InputLabelProps={{ shrink: true }} /></Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Provider</Typography>
                        <Typography variant="body1" gutterBottom>{insuranceData.provider || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Policy Number</Typography>
                        <Typography variant="body1">{insuranceData.policyNumber || 'Not provided'}</Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  {editingInsurance ? (
                    <>
                      <Button onClick={handleInsuranceCancel} sx={{ mr: 1 }}>Cancel</Button>
                      <Button variant="contained" color="primary" onClick={handleInsuranceSave}>Save</Button>
                    </>
                  ) : (
                    <Button size="small" startIcon={<EditIcon />} onClick={() => setEditingInsurance(true)}>
                      Update Insurance
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>

            {/* Emergency Contact (always show, with placeholders if missing) */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PhoneIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Emergency Contact</Typography>
                  </Box>
                  {editingContact ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Name" name="name" value={contactData.name} onChange={handleContactChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Relationship" name="relationship" value={contactData.relationship} onChange={handleContactChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Phone" name="phone" value={contactData.phone} onChange={handleContactChange} margin="normal" />
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Name</Typography>
                        <Typography variant="body1">{contactData.name || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Relationship</Typography>
                        <Typography variant="body1">{contactData.relationship || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Phone</Typography>
                        <Typography variant="body1">{contactData.phone || 'Not provided'}</Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  {editingContact ? (
                    <>
                      <Button onClick={handleContactCancel} sx={{ mr: 1 }}>Cancel</Button>
                      <Button variant="contained" color="primary" onClick={handleContactSave}>Save</Button>
                    </>
                  ) : (
                    <Button size="small" startIcon={<EditIcon />} onClick={() => setEditingContact(true)}>
                      Update Emergency Contact
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (isDoctor) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          {!isEditingDoctor ? (
            <Button startIcon={<EditIcon />} onClick={handleDoctorEdit} variant="contained" color="primary">
              Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={handleDoctorCancel} sx={{ mr: 1 }} variant="outlined">Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleDoctorSubmit}>Save Changes</Button>
            </>
          )}
        </Box>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="primary">Personal Information</Typography>
                  </Box>
                  {!isEditingPersonal ? (
                    <Button startIcon={<EditIcon />} onClick={() => setIsEditingPersonal(true)} size="small" color="primary">
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleCancelPersonal} sx={{ mr: 1 }} variant="outlined">Cancel</Button>
                      <Button variant="contained" color="primary" onClick={handleSavePersonal}>Save</Button>
                    </>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3} display="flex" alignItems="center" justifyContent="center">
                    <Avatar src={formData.photo} sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
                      {!formData.photo && (formData.first_name?.charAt(0) || '') + (formData.last_name?.charAt(0) || '')}
                    </Avatar>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    {isEditingPersonal ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} margin="normal" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} margin="normal" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} margin="normal" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} margin="normal" />
                        </Grid>
                        <Grid item xs={12}>
                          <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ mt: 1 }}>
                            Upload Photo
                            <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                          </Button>
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
                          <Typography variant="body1">{formData.email || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                          <Typography variant="body1">{formData.phone || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                          <Typography variant="body1">Dr. {formData.first_name || 'Not provided'} {formData.last_name || 'Not provided'}</Typography>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {/* Professional Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <HospitalIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="primary">Professional Details</Typography>
                  </Box>
                  {!isEditingProfessional ? (
                    <Button startIcon={<EditIcon />} onClick={() => setIsEditingProfessional(true)} size="small" color="primary">
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleCancelProfessional} sx={{ mr: 1 }} variant="outlined">Cancel</Button>
                      <Button variant="contained" color="primary" onClick={handleSaveProfessional}>Save</Button>
                    </>
                  )}
                </Box>
                {isEditingProfessional ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Specialty" name="specialty" value={formData.specialty} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Qualifications" name="qualifications" value={formData.qualifications} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Languages Spoken" name="languages" value={formData.languages} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Years of Experience" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Medical License Number" name="license_number" value={formData.license_number} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Clinic/Hospital Affiliation" name="clinic_affiliation" value={formData.clinic_affiliation} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Office Address" name="office_address" value={formData.office_address} onChange={handleChange} margin="normal" />
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Specialty</Typography>
                      <Typography variant="body1">{formData.specialty || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Qualifications</Typography>
                      <Typography variant="body1">{formData.qualifications || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Languages Spoken</Typography>
                      <Typography variant="body1">{formData.languages || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Years of Experience</Typography>
                      <Typography variant="body1">{formData.years_of_experience || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Medical License Number</Typography>
                      <Typography variant="body1">{formData.license_number || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Clinic/Hospital Affiliation</Typography>
                      <Typography variant="body1">{formData.clinic_affiliation || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Office Address</Typography>
                      <Typography variant="body1">{formData.office_address || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Consultation Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <CalendarIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="primary">Consultation Details</Typography>
                  </Box>
                  {!isEditingConsultation ? (
                    <Button startIcon={<EditIcon />} onClick={() => setIsEditingConsultation(true)} size="small" color="primary">
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleCancelConsultation} sx={{ mr: 1 }} variant="outlined">Cancel</Button>
                      <Button variant="contained" color="primary" onClick={handleSaveConsultation}>Save</Button>
                    </>
                  )}
                </Box>
                {isEditingConsultation ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Consultation Hours" name="consultation_hours" value={formData.consultation_hours} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Contact Phone" name="phone" value={formData.phone} onChange={handleChange} margin="normal" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Contact Email" name="email" value={formData.email} onChange={handleChange} margin="normal" />
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Consultation Hours</Typography>
                      <Typography variant="body1">{formData.consultation_hours || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Contact Phone</Typography>
                      <Typography variant="body1">{formData.phone || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Contact Email</Typography>
                      <Typography variant="body1">{formData.email || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Box 1: Photo & Name */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: { xs: 2, md: 0 }, height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={formData.photo}
                sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: 48 }}
              >
                {!formData.photo && (formData.first_name?.charAt(0) || '') + (formData.last_name?.charAt(0) || '')}
              </Avatar>
              {isEditing && (
                <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
                  Upload Photo
                  <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                </Button>
              )}
              <Typography variant="h5" fontWeight={600} align="center">
                Dr. {formData.first_name || 'Not provided'} {formData.last_name || 'Not provided'}
              </Typography>
            </CardContent>
            {!isEditing && (
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)} size="small">
                  Edit Profile
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>

        {/* Box 2: Professional Details */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: { xs: 2, md: 0 }, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Professional Details</Typography>
              {isEditing ? (
                <>
                  <TextField fullWidth label="Specialty" name="specialty" value={formData.specialty} onChange={handleChange} margin="normal" />
                  <TextField fullWidth label="Qualifications" name="qualifications" value={formData.qualifications} onChange={handleChange} margin="normal" />
                  <TextField fullWidth label="Languages Spoken" name="languages" value={formData.languages} onChange={handleChange} margin="normal" />
                  <TextField fullWidth label="Years of Experience" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} margin="normal" />
                  <TextField fullWidth label="Medical License Number" name="license_number" value={formData.license_number} onChange={handleChange} margin="normal" />
                  <TextField fullWidth label="Clinic/Hospital Affiliation" name="clinic_affiliation" value={formData.clinic_affiliation} onChange={handleChange} margin="normal" />
                  <TextField fullWidth label="Office Address" name="office_address" value={formData.office_address} onChange={handleChange} margin="normal" />
                </>
              ) : (
                <>
                  <Typography variant="subtitle1"><b>Specialty:</b> {formData.specialty || 'Not provided'}</Typography>
                  <Typography variant="subtitle1"><b>Qualifications:</b> {formData.qualifications || 'Not provided'}</Typography>
                  <Typography variant="subtitle1"><b>Languages Spoken:</b> {formData.languages || 'Not provided'}</Typography>
                  <Typography variant="subtitle1"><b>Years of Experience:</b> {formData.years_of_experience || 'Not provided'}</Typography>
                  <Typography variant="subtitle1"><b>Medical License Number:</b> {formData.license_number || 'Not provided'}</Typography>
                  <Typography variant="subtitle1"><b>Clinic/Hospital Affiliation:</b> {formData.clinic_affiliation || 'Not provided'}</Typography>
                  <Typography variant="subtitle1"><b>Office Address:</b> {formData.office_address || 'Not provided'}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Box 3: Contact & Consultation */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: { xs: 2, md: 0 }, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Contact & Consultation</Typography>
              {isEditing ? (
                <>
                  <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} margin="normal" />
                  <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} margin="normal" />
                  <TextField fullWidth label="Consultation Hours" name="consultation_hours" value={formData.consultation_hours} onChange={handleChange} margin="normal" placeholder="e.g. Mon-Fri 9am-5pm" />
                </>
              ) : (
                <>
                  <Typography variant="subtitle1"><b>Phone:</b> {formData.phone || 'Not provided'}</Typography>
                  <Typography variant="subtitle1"><b>Email:</b> {formData.email || 'Not provided'}</Typography>
                  <Typography variant="subtitle1"><b>Consultation Hours:</b> {formData.consultation_hours || 'Not provided'}</Typography>
                </>
              )}
            </CardContent>
            {isEditing && (
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel} sx={{ mr: 1 }}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>Save Changes</Button>
              </CardActions>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;
export {} 