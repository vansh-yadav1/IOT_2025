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
  useTheme 
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

// Mock medical data
const medicalData = {
  conditions: [
    { id: 1, name: 'Hypertension', since: '2020-05-15', status: 'Controlled' },
    { id: 2, name: 'Type 2 Diabetes', since: '2018-11-22', status: 'Controlled' }
  ],
  medications: [
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', purpose: 'Blood pressure' },
    { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', purpose: 'Diabetes' }
  ],
  allergies: [
    { id: 1, name: 'Penicillin', severity: 'Severe', reaction: 'Rash, difficulty breathing' },
    { id: 2, name: 'Peanuts', severity: 'Moderate', reaction: 'Swelling, hives' }
  ],
  immunizations: [
    { id: 1, name: 'Influenza vaccine', date: '2023-10-05', provider: 'City Medical Center' },
    { id: 2, name: 'COVID-19 vaccine', date: '2023-01-15', provider: 'City Medical Center' },
    { id: 3, name: 'Tetanus booster', date: '2019-03-22', provider: 'County Hospital' }
  ],
  bloodType: 'A+',
  height: '175 cm',
  weight: '82 kg',
  bmi: 26.8
};

const MedicalProfile: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const { loading, metrics, fetchMetrics } = useHealthMetrics();

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
          <Tab icon={<HistoryIcon />} label="Medical History" {...a11yProps(3)} />
        </Tabs>
      
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Basic health information */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Blood Type" secondary={medicalData.bloodType} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Height" secondary={medicalData.height} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Weight" secondary={medicalData.weight} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="BMI" 
                        secondary={
                          <Box component="span" sx={{
                            color: medicalData.bmi > 25 ? 'warning.main' : 'success.main',
                            fontWeight: 'medium'
                          }}>
                            {medicalData.bmi} ({medicalData.bmi > 25 ? 'Overweight' : 'Normal'})
                          </Box>
                        } 
                      />
                    </ListItem>
                  </List>
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
                        {medicalData.conditions.map(condition => (
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
                        {medicalData.allergies.map(allergy => (
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
                    <Button startIcon={<EditIcon />} size="small" variant="outlined">
                      Update Conditions
                    </Button>
                  </Box>
                  
                  {medicalData.conditions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No medical conditions recorded.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {medicalData.conditions.map(condition => (
                        <Grid item xs={12} key={condition.id}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="medium">
                              {condition.name}
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Since: {formatDate(condition.since)}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  Status: <Box component="span" sx={{ 
                                    color: condition.status === 'Controlled' ? 'success.main' : 'warning.main',
                                    fontWeight: 'medium'
                                  }}>
                                    {condition.status}
                                  </Box>
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
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
                    <Button startIcon={<EditIcon />} size="small" variant="outlined">
                      Update Medications
                    </Button>
                  </Box>
                  
                  {medicalData.medications.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No medications recorded.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {medicalData.medications.map(medication => (
                        <Grid item xs={12} sm={6} md={4} key={medication.id}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="medium">
                              {medication.name}
                            </Typography>
                            <List dense disablePadding sx={{ mt: 1 }}>
                              <ListItem disablePadding sx={{ py: 0.5 }}>
                                <ListItemText primary="Dosage" secondary={medication.dosage} />
                              </ListItem>
                              <ListItem disablePadding sx={{ py: 0.5 }}>
                                <ListItemText primary="Frequency" secondary={medication.frequency} />
                              </ListItem>
                              <ListItem disablePadding sx={{ py: 0.5 }}>
                                <ListItemText primary="Purpose" secondary={medication.purpose} />
                              </ListItem>
                            </List>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
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
                  <Typography variant="h6" gutterBottom>
                    Immunization History
                  </Typography>
                  
                  {medicalData.immunizations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No immunizations recorded.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {medicalData.immunizations.map(immunization => (
                        <Grid item xs={12} sm={6} md={4} key={immunization.id}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="medium">
                              {immunization.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Date: {formatDate(immunization.date)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Provider: {immunization.provider}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
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