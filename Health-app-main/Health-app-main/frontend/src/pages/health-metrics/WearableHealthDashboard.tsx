import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { 
  DirectionsRunOutlined, 
  FavoriteBorderOutlined, 
  BedtimeOutlined, 
  MonitorHeartOutlined,
  WatchOutlined,
  PoolOutlined,
  SpeedOutlined,
  RestaurantOutlined,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

// Import the components we created
import ActivityRings from '../../components/wearable/ActivityRings';
import HealthDataCard from '../../components/wearable/HealthDataCard';
import HealthDataChart from '../../components/wearable/HealthDataChart';
import DeviceCard from '../../components/wearable/DeviceCard';

// Import the service for data fetching
import { 
  getHealthSummary, 
  getUserDevices, 
  getHeartRateData,
  getActivityData,
  getSleepData,
  getBloodOxygenData,
  getConnectedSources,
  getConnectionLink,
} from '../../services/wearableService';

// Create an interface for the active tab
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const WearableHealthDashboard: React.FC = () => {
  // Get user ID from router params (or use a default for testing)
  const { userId } = useParams<{ userId: string }>();
  const currentUserId = userId || 'test_user_id';
  
  // State for tab selection
  const [activeTab, setActiveTab] = useState(0);
  
  // State for time period selection
  const [timePeriod, setTimePeriod] = useState('week');
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  
  // State for data
  const [summary, setSummary] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [heartRateData, setHeartRateData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [sleepData, setSleepData] = useState<any>(null);
  const [bloodOxygenData, setBloodOxygenData] = useState<any>(null);
  const [connectionLink, setConnectionLink] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle time period change
  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    setTimePeriod(event.target.value);
  };
  
  // Calculate dates for data fetching based on time period
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    if (timePeriod === 'day') {
      startDate.setDate(endDate.getDate() - 1);
    } else if (timePeriod === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timePeriod === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else if (timePeriod === 'year') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };
  
  // Fetch data on component mount and when time period changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get date range for queries
        const { startDate, endDate } = getDateRange();
        
        // Fetch data in parallel
        const [
          summarynData,
          devicesData,
          heartRate,
          activity,
          sleep,
          bloodOxygen,
          link
        ] = await Promise.all([
          getHealthSummary(currentUserId, timePeriod),
          getUserDevices(currentUserId),
          getHeartRateData(currentUserId, startDate, endDate),
          getActivityData(currentUserId, startDate, endDate),
          getSleepData(currentUserId, startDate, endDate),
          getBloodOxygenData(currentUserId, startDate, endDate),
          getConnectionLink(currentUserId)
        ]);
        
        // Update state with fetched data
        setSummary(summarynData);
        setDevices(devicesData);
        setHeartRateData(heartRate);
        setActivityData(activity);
        setSleepData(sleep);
        setBloodOxygenData(bloodOxygen);
        setConnectionLink(link);
      } catch (err) {
        console.error('Error fetching wearable data:', err);
        setError('Failed to load health data from your wearable devices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUserId, timePeriod]);
  
  // Handle connecting a new device
  const handleConnectDevice = () => {
    if (connectionLink) {
      window.open(connectionLink, '_blank');
    }
  };
  
  // Format data for the activity rings
  const getActivityRingValues = () => {
    if (!summary || !summary.activity) {
      return { move: 0, exercise: 0, stand: 0 };
    }
    
    // Calculate ring values based on reasonable goals
    const moveValue = summary.activity.total_calories ? Math.min(summary.activity.total_calories / 600, 1) : 0;
    const exerciseValue = summary.activity.active_minutes ? Math.min(summary.activity.active_minutes / 60, 1) : 0; 
    const standValue = summary.activity.total_steps ? Math.min(summary.activity.total_steps / 10000, 1) : 0;
    
    return { move: moveValue, exercise: exerciseValue, stand: standValue };
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Wearable Health Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        View your health data from connected wearable devices
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="time-period-label">Time Period</InputLabel>
              <Select
                labelId="time-period-label"
                id="time-period-select"
                value={timePeriod}
                label="Time Period"
                onChange={handleTimePeriodChange}
              >
                <MenuItem value="day">Last 24 Hours</MenuItem>
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleConnectDevice}
              startIcon={<WatchOutlined />}
              sx={{ mt: { xs: 2, md: 0 } }}
            >
              Connect a Device
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Activity Rings Section */}
          <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Activity Summary
            </Typography>
            <Typography variant="body2" paragraph sx={{ mb: 3 }}>
              Your activity data for the selected time period.
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <HealthDataCard
                  title="Steps"
                  value={summary?.activity?.total_steps || 0}
                  unit="steps"
                  icon={<DirectionsRunOutlined />}
                  color="#FF3B30"
                  progress={summary?.activity?.total_steps ? Math.min(summary.activity.total_steps / 10000, 1) : 0}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <HealthDataCard
                  title="Calories"
                  value={summary?.activity?.total_calories || 0}
                  unit="kcal"
                  icon={<RestaurantOutlined />}
                  color="#4CD964"
                  progress={summary?.activity?.total_calories ? Math.min(summary.activity.total_calories / 600, 1) : 0}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <HealthDataCard
                  title="Distance"
                  value={summary?.activity?.total_distance ? (summary.activity.total_distance / 1000).toFixed(2) : 0}
                  unit="km"
                  icon={<PoolOutlined />}
                  color="#007AFF"
                  progress={summary?.activity?.total_distance ? Math.min(summary.activity.total_distance / 10000, 1) : 0}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Health Summary Section */}
          <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Health Metrics Summary
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <HealthDataCard
                  title="Resting Heart Rate"
                  value={summary?.heart_rate?.resting_hr || 0}
                  unit="bpm"
                  icon={<FavoriteBorderOutlined />}
                  color="#FF3B30"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <HealthDataCard
                  title="Blood Oxygen"
                  value={summary?.blood_oxygen?.average || 0}
                  unit="%"
                  icon={<MonitorHeartOutlined />}
                  color="#007AFF"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <HealthDataCard
                  title="Sleep Duration"
                  value={summary?.sleep?.average_duration ? (summary.sleep.average_duration / 60).toFixed(1) : 0}
                  unit="hrs"
                  icon={<BedtimeOutlined />}
                  color="#4CD964"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <HealthDataCard
                  title="Active Minutes"
                  value={summary?.activity?.active_minutes || 0}
                  unit="min"
                  icon={<DirectionsRunOutlined />}
                  color="#FF9500"
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Detailed Data Tabs */}
          <Paper sx={{ p: 2, mb: 4, boxShadow: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Heart Rate" />
              <Tab label="Activity" />
              <Tab label="Sleep" />
              <Tab label="Connected Devices" />
            </Tabs>
            
            {/* Heart Rate Tab */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>Heart Rate</Typography>
              <Box sx={{ height: 400, mb: 4 }}>
                {heartRateData?.heart_rate_data && heartRateData.heart_rate_data.length > 0 ? (
                  <HealthDataChart 
                    title="Heart Rate Over Time" 
                    data={heartRateData.heart_rate_data.map((item: any) => ({
                      timestamp: item.timestamp,
                      value: item.bpm
                    }))}
                    dataKey="value"
                    color="#FF3B30"
                    unit="bpm"
                    yAxisLabel="Heart Rate (BPM)"
                    height={350}
                  />
                ) : (
                  <Alert severity="info">No heart rate data available for this time period.</Alert>
                )}
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Average Heart Rate"
                    value={summary?.heart_rate?.average_hr || 0}
                    unit="bpm"
                    icon={<FavoriteBorderOutlined />}
                    color="#FF3B30"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Resting Heart Rate"
                    value={summary?.heart_rate?.resting_hr || 0}
                    unit="bpm"
                    icon={<FavoriteBorderOutlined />}
                    color="#FF3B30"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Max Heart Rate"
                    value={summary?.heart_rate?.max_hr || 0}
                    unit="bpm"
                    icon={<SpeedOutlined />}
                    color="#FF3B30"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Min Heart Rate"
                    value={summary?.heart_rate?.min_hr || 0}
                    unit="bpm"
                    icon={<FavoriteBorderOutlined />}
                    color="#FF3B30"
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Activity Tab */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom>Activity</Typography>
              <Box sx={{ height: 400, mb: 4 }}>
                {activityData?.activity_data && activityData.activity_data.length > 0 ? (
                  <HealthDataChart 
                    title="Steps Over Time" 
                    data={activityData.activity_data.map((item: any) => ({
                      timestamp: item.timestamp,
                      value: item.steps
                    }))}
                    dataKey="value"
                    color="#4CD964"
                    unit="steps"
                    yAxisLabel="Steps"
                    height={350}
                  />
                ) : (
                  <Alert severity="info">No activity data available for this time period.</Alert>
                )}
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Total Steps"
                    value={summary?.activity?.total_steps || 0}
                    unit="steps"
                    icon={<DirectionsRunOutlined />}
                    color="#4CD964"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Total Distance"
                    value={summary?.activity?.total_distance ? (summary.activity.total_distance / 1000).toFixed(2) : 0}
                    unit="km"
                    icon={<PoolOutlined />}
                    color="#4CD964"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Calories Burned"
                    value={summary?.activity?.total_calories || 0}
                    unit="kcal"
                    icon={<RestaurantOutlined />}
                    color="#4CD964"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Active Minutes"
                    value={summary?.activity?.active_minutes || 0}
                    unit="min"
                    icon={<DirectionsRunOutlined />}
                    color="#4CD964"
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Sleep Tab */}
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" gutterBottom>Sleep</Typography>
              <Box sx={{ height: 400, mb: 4 }}>
                {sleepData?.sleep_data && sleepData.sleep_data.length > 0 ? (
                  <HealthDataChart 
                    title="Sleep Duration Over Time" 
                    data={sleepData.sleep_data.map((item: any) => ({
                      timestamp: item.timestamp,
                      value: item.duration / 60 // Convert minutes to hours
                    }))}
                    dataKey="value"
                    color="#007AFF"
                    unit="hrs"
                    yAxisLabel="Sleep Duration (hours)"
                    formatValue={(value) => value.toFixed(1)}
                    height={350}
                  />
                ) : (
                  <Alert severity="info">No sleep data available for this time period.</Alert>
                )}
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Average Sleep"
                    value={summary?.sleep?.average_duration ? (summary.sleep.average_duration / 60).toFixed(1) : 0}
                    unit="hrs"
                    icon={<BedtimeOutlined />}
                    color="#007AFF"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Sleep Efficiency"
                    value={summary?.sleep?.average_efficiency ? (summary.sleep.average_efficiency * 100).toFixed(0) : 0}
                    unit="%"
                    icon={<BedtimeOutlined />}
                    color="#007AFF"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="Deep Sleep"
                    value={summary?.sleep?.average_deep_sleep ? (summary.sleep.average_deep_sleep / 60).toFixed(1) : 0}
                    unit="hrs"
                    icon={<BedtimeOutlined />}
                    color="#007AFF"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <HealthDataCard
                    title="REM Sleep"
                    value={summary?.sleep?.average_rem_sleep ? (summary.sleep.average_rem_sleep / 60).toFixed(1) : 0}
                    unit="hrs"
                    icon={<BedtimeOutlined />}
                    color="#007AFF"
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Connected Devices Tab */}
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h6" gutterBottom>Connected Devices</Typography>
              
              {devices && devices.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {devices.map((device, index) => (
                    <DeviceCard key={index} device={device} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Alert severity="info">
                    No wearable devices connected yet. Click the "Connect a Device" button to add a device.
                  </Alert>
                </Box>
              )}
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleConnectDevice}
                  startIcon={<WatchOutlined />}
                >
                  Connect New Device
                </Button>
              </Box>
            </TabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default WearableHealthDashboard; 