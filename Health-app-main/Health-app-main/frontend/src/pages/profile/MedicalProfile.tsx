import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Skeleton,
  useTheme,
  TextField,
  MenuItem
} from '@mui/material';
import { 
  Favorite as HeartIcon, 
  Bloodtype as BloodIcon, 
  AirOutlined as OxygenIcon, 
  Thermostat as TemperatureIcon,
  EditNote as EditIcon,
  MedicalInformation as MedicalIcon,
  MedicalServices as MedicalServicesIcon,
  Medication as MedicationIcon,
  EventNote as HistoryIcon,
  ShowChart as ChartIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useHealthMetrics } from '../../hooks/useHealthMetrics';
import { MetricsVisualization } from '../../components/health-metrics';
import { formatDate, getMetricColors } from '../../utils/metricsUtils';
import { useAuth } from '../../context/AuthContext';
import { updatePatient } from '../../services/supabaseService';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`medical-tabpanel-${index}`}
      aria-labelledby={`medical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `medical-tab-${index}`,
    'aria-controls': `medical-tabpanel-${index}`,
  };
}

// Add these interfaces after the TabPanelProps interface
interface BasicInfo {
  bloodType: string;
  height: string;
  weight: string;
  bmi: string;
}

interface Condition {
  id: number;
  name: string;
  since: string;
  status: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
}

interface Allergy {
  id: number;
  name: string;
  severity: string;
  reaction: string;
}

interface Immunization {
  id: number;
  name: string;
  date: string;
  provider: string;
}

interface MedicalProfileProps {
  patientId?: string;
  isDoctorView?: boolean;
}

const MedicalProfile: React.FC<MedicalProfileProps> = ({ patientId, isDoctorView }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const { loading, metrics, fetchMetrics } = useHealthMetrics();
  const { user } = useAuth();

  // Use patientId if provided, otherwise fallback to current user
  const profileUserId = patientId || user?.id;
  // Allow doctors to edit any patient's profile, and patients to edit their own
  const canEdit = user && (user.user_metadata.role === 'DOCTOR' || user.id === profileUserId);

  // Update state definitions with proper types
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    bloodType: '',
    height: '',
    weight: '',
    bmi: ''
  });
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);

  const [conditions, setConditions] = useState<Condition[]>([]);
  const [editingConditions, setEditingConditions] = useState(false);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [editingMedications, setEditingMedications] = useState(false);

  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [editingAllergies, setEditingAllergies] = useState(false);

  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [editingImmunizations, setEditingImmunizations] = useState(false);

  // Load all data from localStorage on mount
  useEffect(() => {
    const savedBasicInfo = localStorage.getItem('medicalBasicInfo');
    if (savedBasicInfo) setBasicInfo(JSON.parse(savedBasicInfo));
    const savedConditions = localStorage.getItem('medicalConditions');
    if (savedConditions) setConditions(JSON.parse(savedConditions));
    const savedMedications = localStorage.getItem('medicalMedications');
    if (savedMedications) setMedications(JSON.parse(savedMedications));
    const savedAllergies = localStorage.getItem('medicalAllergies');
    if (savedAllergies) setAllergies(JSON.parse(savedAllergies));
    const savedImmunizations = localStorage.getItem('medicalImmunizations');
    if (savedImmunizations) setImmunizations(JSON.parse(savedImmunizations));
  }, []);

  // Update handler types
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };
  const handleBasicInfoSave = () => {
    localStorage.setItem('medicalBasicInfo', JSON.stringify(basicInfo));
    setEditingBasicInfo(false);
  };
  const handleBasicInfoCancel = () => {
    const saved = localStorage.getItem('medicalBasicInfo');
    setBasicInfo(saved ? JSON.parse(saved) : { bloodType: '', height: '', weight: '', bmi: '' });
    setEditingBasicInfo(false);
  };

  const handleAddCondition = (newCondition: Condition) => {
    setConditions(prev => [...prev, newCondition]);
  };
  const handleRemoveCondition = (id: number) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };
  const handleConditionsSave = () => {
    localStorage.setItem('medicalConditions', JSON.stringify(conditions));
    setEditingConditions(false);
  };
  const handleConditionsCancel = () => {
    const saved = localStorage.getItem('medicalConditions');
    setConditions(saved ? JSON.parse(saved) : []);
    setEditingConditions(false);
  };

  const handleAddMedication = (newMedication: Medication) => {
    setMedications(prev => [...prev, newMedication]);
  };
  const handleRemoveMedication = (id: number) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };
  const handleMedicationsSave = () => {
    localStorage.setItem('medicalMedications', JSON.stringify(medications));
    setEditingMedications(false);
  };
  const handleMedicationsCancel = () => {
    const saved = localStorage.getItem('medicalMedications');
    setMedications(saved ? JSON.parse(saved) : []);
    setEditingMedications(false);
  };

  const handleAddAllergy = (newAllergy: Allergy) => {
    setAllergies(prev => [...prev, newAllergy]);
  };
  const handleRemoveAllergy = (id: number) => {
    setAllergies(prev => prev.filter(a => a.id !== id));
  };
  const handleAllergiesSave = () => {
    localStorage.setItem('medicalAllergies', JSON.stringify(allergies));
    setEditingAllergies(false);
  };
  const handleAllergiesCancel = () => {
    const saved = localStorage.getItem('medicalAllergies');
    setAllergies(saved ? JSON.parse(saved) : []);
    setEditingAllergies(false);
  };

  const handleAddImmunization = (newImmunization: Immunization) => {
    setImmunizations(prev => [...prev, newImmunization]);
  };
  const handleRemoveImmunization = (id: number) => {
    setImmunizations(prev => prev.filter(i => i.id !== id));
  };
  const handleImmunizationsSave = () => {
    localStorage.setItem('medicalImmunizations', JSON.stringify(immunizations));
    setEditingImmunizations(false);
  };
  const handleImmunizationsCancel = () => {
    const saved = localStorage.getItem('medicalImmunizations');
    setImmunizations(saved ? JSON.parse(saved) : []);
    setEditingImmunizations(false);
  };

  // Fetch metrics data
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <MedicalIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            Medical Profile
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={3}>
          View and manage your personal health information, medical conditions, and vital signs.
        </Typography>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="medical profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ChartIcon />} label="Health Overview" {...a11yProps(0)} />
          <Tab icon={<MedicalServicesIcon />} label="Medical Conditions" {...a11yProps(1)} />
          <Tab icon={<MedicationIcon />} label="Medications" {...a11yProps(2)} />
          <Tab icon={<MedicalServicesIcon />} label="Allergies" {...a11yProps(3)} />
          <Tab icon={<HistoryIcon />} label="Medical History" {...a11yProps(4)} />
        </Tabs>
      
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Basic health information */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Basic Information</Typography>
                    {canEdit && !editingBasicInfo && (
                      <Button startIcon={<EditIcon />} size="small" variant="outlined" onClick={() => setEditingBasicInfo(true)}>
                        Edit
                      </Button>
                    )}
                  </Box>
                  {editingBasicInfo ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Blood Type" name="bloodType" value={basicInfo.bloodType} onChange={handleBasicInfoChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Height" name="height" value={basicInfo.height} onChange={handleBasicInfoChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Weight" name="weight" value={basicInfo.weight} onChange={handleBasicInfoChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="BMI" name="bmi" value={basicInfo.bmi} onChange={handleBasicInfoChange} margin="normal" />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button onClick={handleBasicInfoCancel} sx={{ mr: 1 }}>Cancel</Button>
                          <Button variant="contained" color="primary" onClick={handleBasicInfoSave}>Save</Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Blood Type" secondary={basicInfo.bloodType} />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText primary="Height" secondary={basicInfo.height} />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText primary="Weight" secondary={basicInfo.weight} />
                      </ListItem>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText primary="BMI" secondary={basicInfo.bmi} />
                      </ListItem>
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick summary of conditions */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Conditions & Allergies
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Medical Conditions
                      </Typography>
                      <List dense>
                        {conditions.map(condition => (
                          <ListItem key={condition.id}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <MedicalServicesIcon fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={condition.name} 
                              secondary={`Since ${formatDate(condition.since)} • ${condition.status}`} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Allergies
                      </Typography>
                      <List dense>
                        {allergies.map(allergy => (
                          <ListItem key={allergy.id}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Box 
                                component="span" 
                                sx={{
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  bgcolor: allergy.severity === 'Severe' ? 'error.main' : 'warning.main',
                                  display: 'inline-block'
                                }} 
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary={allergy.name} 
                              secondary={`${allergy.severity} • ${allergy.reaction}`} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Health metrics section */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Recent Health Metrics
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link} 
                      to="/health-metrics"
                    >
                      View All Metrics
                    </Button>
                  </Box>
                  
                  {loading ? (
                    <Grid container spacing={3}>
                      {[1, 2, 3, 4].map(i => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                          <Skeleton variant="rectangular" height={120} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Grid container spacing={3}>
                      {metrics.map(metric => {
                        const colors = getMetricColors(metric.id as any);
                        return (
                          <Grid item xs={12} sm={6} md={3} key={metric.id}>
                            <Paper 
                              elevation={0} 
                              sx={{ 
                                p: 2, 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1,
                                height: '100%'
                              }}
                            >
                              <Box display="flex" alignItems="center" mb={1}>
                                <Box 
                                  className={metric.iconClass} 
                                  sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'white',
                                    mr: 1,
                                    bgcolor: colors.primary
                                  }}
                                >
                                  {metric.id === 'heart-rate' && <HeartIcon fontSize="small" />}
                                  {metric.id === 'blood-pressure' && <BloodIcon fontSize="small" />}
                                  {metric.id === 'oxygen-level' && <OxygenIcon fontSize="small" />}
                                  {metric.id === 'body-temperature' && <TemperatureIcon fontSize="small" />}
                                </Box>
                                <Typography variant="subtitle1">
                                  {metric.title}
                                </Typography>
                              </Box>
                              
                              <Typography variant="h5" sx={{ mb: 1 }}>
                                {metric.current} <Typography component="span" variant="body2" color="text.secondary">{metric.unit}</Typography>
                              </Typography>
                              
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Normal range: {metric.normalRange} {metric.unit}
                              </Typography>
                              
                              <Box sx={{ height: 60, mt: 1 }}>
                                <MetricsVisualization 
                                  metricId={metric.id as any}
                                  labels={metric.chartData.labels}
                                  datasets={metric.chartData.datasets}
                                  height={60}
                                  beginAtZero={false}
                                />
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Medical Conditions</Typography>
                    {canEdit && !editingConditions && (
                      <Button startIcon={<EditIcon />} size="small" variant="outlined" onClick={() => setEditingConditions(true)}>
                        Update Conditions
                      </Button>
                    )}
                  </Box>
                  
                  {editingConditions ? (
                    <Grid container spacing={2}>
                      {conditions.map((condition, idx) => (
                        <Grid item xs={12} key={condition.id}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  label="Condition Name"
                                  value={condition.name}
                                  onChange={e => {
                                    const updated = [...conditions];
                                    updated[idx] = { ...condition, name: e.target.value };
                                    setConditions(updated);
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  label="Since"
                                  type="date"
                                  value={condition.since}
                                  InputLabelProps={{ shrink: true }}
                                  onChange={e => {
                                    const updated = [...conditions];
                                    updated[idx] = { ...condition, since: e.target.value };
                                    setConditions(updated);
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <TextField
                                  select
                                  fullWidth
                                  label="Status"
                                  value={condition.status}
                                  onChange={e => {
                                    const updated = [...conditions];
                                    updated[idx] = { ...condition, status: e.target.value };
                                    setConditions(updated);
                                  }}
                                >
                                  <MenuItem value="Active">Active</MenuItem>
                                  <MenuItem value="Controlled">Controlled</MenuItem>
                                  <MenuItem value="Resolved">Resolved</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid item xs={12} sm={1}>
                                <Button size="small" color="error" onClick={() => handleRemoveCondition(condition.id)}>
                                  Remove
                                </Button>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => handleAddCondition({ id: Date.now(), name: '', since: '', status: 'Active' })}>
                          Add Condition
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button onClick={handleConditionsCancel} sx={{ mr: 1 }}>Cancel</Button>
                          <Button variant="contained" color="primary" onClick={handleConditionsSave}>Save</Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    conditions.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No medical conditions recorded.</Typography>
                    ) : (
                      <Grid container spacing={2}>
                        {conditions.map(condition => (
                          <Grid item xs={12} key={condition.id}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">{condition.name}</Typography>
                              <Typography variant="body2" color="text.secondary">Since: {formatDate(condition.since)}</Typography>
                              <Typography variant="body2">Status: {condition.status}</Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Current Medications</Typography>
                    {canEdit && !editingMedications && (
                      <Button startIcon={<EditIcon />} size="small" variant="outlined" onClick={() => setEditingMedications(true)}>
                        Update Medications
                      </Button>
                    )}
                  </Box>
                  
                  {editingMedications ? (
                    <Grid container spacing={2}>
                      {medications.map((medication, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={medication.id}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Medication Name"
                                  value={medication.name}
                                  onChange={e => {
                                    const updated = [...medications];
                                    updated[idx] = { ...medication, name: e.target.value };
                                    setMedications(updated);
                                  }}
                                  sx={{ mb: 1 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Dosage"
                                  value={medication.dosage}
                                  onChange={e => {
                                    const updated = [...medications];
                                    updated[idx] = { ...medication, dosage: e.target.value };
                                    setMedications(updated);
                                  }}
                                  sx={{ mb: 1 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Frequency"
                                  value={medication.frequency}
                                  onChange={e => {
                                    const updated = [...medications];
                                    updated[idx] = { ...medication, frequency: e.target.value };
                                    setMedications(updated);
                                  }}
                                  sx={{ mb: 1 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Purpose"
                                  value={medication.purpose}
                                  onChange={e => {
                                    const updated = [...medications];
                                    updated[idx] = { ...medication, purpose: e.target.value };
                                    setMedications(updated);
                                  }}
                                  sx={{ mb: 1 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Button size="small" color="error" onClick={() => handleRemoveMedication(medication.id)}>
                                  Remove
                                </Button>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => handleAddMedication({ id: Date.now(), name: '', dosage: '', frequency: '', purpose: '' })}>
                          Add Medication
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button onClick={handleMedicationsCancel} sx={{ mr: 1 }}>Cancel</Button>
                          <Button variant="contained" color="primary" onClick={handleMedicationsSave}>Save</Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    medications.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No medications recorded.</Typography>
                    ) : (
                      <Grid container spacing={2}>
                        {medications.map(medication => (
                          <Grid item xs={12} sm={6} md={4} key={medication.id}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">{medication.name}</Typography>
                              <Typography variant="body2">Dosage: {medication.dosage}</Typography>
                              <Typography variant="body2">Frequency: {medication.frequency}</Typography>
                              <Typography variant="body2">Purpose: {medication.purpose}</Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Allergies</Typography>
                    {canEdit && !editingAllergies && (
                      <Button startIcon={<EditIcon />} size="small" variant="outlined" onClick={() => setEditingAllergies(true)}>
                        Update Allergies
                      </Button>
                    )}
                  </Box>
                  {editingAllergies ? (
                    <Grid container spacing={2}>
                      {allergies.map((allergy, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={allergy.id}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Allergy Name"
                                  value={allergy.name}
                                  onChange={e => {
                                    const updated = [...allergies];
                                    updated[idx] = { ...allergy, name: e.target.value };
                                    setAllergies(updated);
                                  }}
                                  sx={{ mb: 1 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  select
                                  fullWidth
                                  label="Severity"
                                  value={allergy.severity}
                                  onChange={e => {
                                    const updated = [...allergies];
                                    updated[idx] = { ...allergy, severity: e.target.value };
                                    setAllergies(updated);
                                  }}
                                  sx={{ mb: 1 }}
                                >
                                  <MenuItem value="Mild">Mild</MenuItem>
                                  <MenuItem value="Moderate">Moderate</MenuItem>
                                  <MenuItem value="Severe">Severe</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Reaction"
                                  value={allergy.reaction}
                                  onChange={e => {
                                    const updated = [...allergies];
                                    updated[idx] = { ...allergy, reaction: e.target.value };
                                    setAllergies(updated);
                                  }}
                                  sx={{ mb: 1 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Button size="small" color="error" onClick={() => handleRemoveAllergy(allergy.id)}>
                                  Remove
                                </Button>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => handleAddAllergy({ id: Date.now(), name: '', severity: 'Mild', reaction: '' })}>
                          Add Allergy
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button onClick={handleAllergiesCancel} sx={{ mr: 1 }}>Cancel</Button>
                          <Button variant="contained" color="primary" onClick={handleAllergiesSave}>Save</Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    allergies.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No allergies recorded.</Typography>
                    ) : (
                      <Grid container spacing={2}>
                        {allergies.map(allergy => (
                          <Grid item xs={12} sm={6} md={4} key={allergy.id}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">{allergy.name}</Typography>
                              <Typography variant="body2">Severity: {allergy.severity}</Typography>
                              <Typography variant="body2">Reaction: {allergy.reaction}</Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Immunization History</Typography>
                  
                  {editingImmunizations ? (
                    <Grid container spacing={2}>
                      {immunizations.map(immunization => (
                        <Grid item xs={12} sm={6} md={4} key={immunization.id}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">{immunization.name}</Typography>
                            <Typography variant="body2" color="text.secondary">Date: {formatDate(immunization.date)}</Typography>
                            <Typography variant="body2" color="text.secondary">Provider: {immunization.provider}</Typography>
                            <Button size="small" color="error" onClick={() => handleRemoveImmunization(immunization.id)}>Remove</Button>
                          </Paper>
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => handleAddImmunization({ id: Date.now(), name: 'New Immunization', date: new Date().toISOString().split('T')[0], provider: '' })}>
                          Add Immunization
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button onClick={handleImmunizationsCancel} sx={{ mr: 1 }}>Cancel</Button>
                          <Button variant="contained" color="primary" onClick={handleImmunizationsSave}>Save</Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    immunizations.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No immunizations recorded.</Typography>
                    ) : (
                      <Grid container spacing={2}>
                        {immunizations.map(immunization => (
                          <Grid item xs={12} sm={6} md={4} key={immunization.id}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">{immunization.name}</Typography>
                              <Typography variant="body2" color="text.secondary">Date: {formatDate(immunization.date)}</Typography>
                              <Typography variant="body2" color="text.secondary">Provider: {immunization.provider}</Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MedicalProfile; 