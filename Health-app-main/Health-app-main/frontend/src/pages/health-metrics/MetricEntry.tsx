import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  InputAdornment,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  Save as SaveIcon,
  Favorite as HeartIcon,
  Bloodtype as BloodIcon,
  AirOutlined as OxygenIcon,
  Thermostat as TemperatureIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';
import './HealthMetrics.css';
import MetricsSidebar from '../../components/health-metrics/MetricsSidebar';

// Form interfaces
interface MetricFormData {
  value: number;
  date: Date;
  time: Date;
  notes: string;
}

interface MetricConfig {
  id: string;
  name: string;
  unit: string;
  icon: React.ReactNode;
  iconClass: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

const MetricEntry: React.FC = () => {
  const { metricId, readingId } = useParams<{ metricId: string; readingId: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = readingId !== undefined;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<MetricFormData>({
    value: 0,
    date: new Date(),
    time: new Date(),
    notes: ''
  });

  // Metrics configuration
  const metricsConfig: Record<string, MetricConfig> = {
    'heart-rate': {
      id: 'heart-rate',
      name: 'Heart Rate',
      unit: 'bpm',
      icon: <HeartIcon />,
      iconClass: 'heart-icon',
      min: 40,
      max: 200,
      step: 1,
      defaultValue: 70
    },
    'blood-pressure': {
      id: 'blood-pressure',
      name: 'Blood Pressure',
      unit: 'mmHg',
      icon: <BloodIcon />,
      iconClass: 'blood-icon',
      min: 80,
      max: 200,
      step: 1,
      defaultValue: 120
    },
    'oxygen-level': {
      id: 'oxygen-level',
      name: 'Oxygen Level',
      unit: '%',
      icon: <OxygenIcon />,
      iconClass: 'oxygen-icon',
      min: 80,
      max: 100,
      step: 1,
      defaultValue: 98
    },
    'body-temperature': {
      id: 'body-temperature',
      name: 'Body Temperature',
      unit: '°C',
      icon: <TemperatureIcon />,
      iconClass: 'temperature-icon',
      min: 35,
      max: 42,
      step: 0.1,
      defaultValue: 36.6
    }
  };

  // Current metric config
  const currentMetric = metricId && metricId in metricsConfig 
    ? metricsConfig[metricId] 
    : metricsConfig['heart-rate'];

  // For edit mode, fetch the reading data
  useEffect(() => {
    if (isEditMode) {
      // Simulate API call
      setTimeout(() => {
        // Mock data for the reading
        const mockReading = {
          id: parseInt(readingId || '0'),
          value: currentMetric.defaultValue + Math.random() * 10,
          date: new Date(),
          time: new Date(),
          notes: 'Previous reading notes'
        };

        setFormData(mockReading);
        setLoading(false);
      }, 800);
    } else {
      // New entry - set default value from current metric
      setFormData(prev => ({
        ...prev,
        value: currentMetric.defaultValue
      }));
    }
  }, [metricId, readingId, isEditMode, currentMetric.defaultValue]);

  // Handle form changes
  const handleValueChange = (event: Event, newValue: number | number[]) => {
    setFormData({
      ...formData,
      value: newValue as number
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setFormData({
        ...formData,
        date: newDate
      });
    }
  };

  const handleTimeChange = (newTime: Date | null) => {
    if (newTime) {
      setFormData({
        ...formData,
        time: newTime
      });
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      try {
        // In a real app, this would be an API call
        console.log('Saving metric data:', {
          metricId,
          ...formData,
          date: format(formData.date, 'yyyy-MM-dd'),
          time: format(formData.time, 'HH:mm')
        });
        
        setSuccess(true);
        
        // Redirect after short delay
        setTimeout(() => {
          navigate(`/health-metrics/${metricId}`);
        }, 1500);
      } catch (err) {
        setError('An error occurred while saving your data. Please try again.');
      } finally {
        setSaving(false);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <Container className="data-entry-container">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Grid container sx={{ height: '100%' }}>
      <Grid item xs={12} md={3} lg={2.5} sx={{ display: { xs: 'none', md: 'block' } }}>
        <MetricsSidebar />
      </Grid>
      <Grid item xs={12} md={9} lg={9.5}>
        <Container className="data-entry-container">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button 
              startIcon={<ChevronLeftIcon />} 
              onClick={() => navigate(`/health-metrics/${metricId}`)}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Box 
              className={`metric-icon ${currentMetric.iconClass}`}
              sx={{ mr: 2 }}
            >
              {currentMetric.icon}
            </Box>
            <Typography variant="h4" component="h1">
              {isEditMode ? 'Edit' : 'Add'} {currentMetric.name} Reading
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Reading {isEditMode ? 'updated' : 'added'} successfully!
            </Alert>
          )}

          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    {currentMetric.name} Value ({currentMetric.unit})
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Slider
                      value={formData.value}
                      onChange={handleValueChange}
                      min={currentMetric.min}
                      max={currentMetric.max}
                      step={currentMetric.step}
                      valueLabelDisplay="auto"
                      disabled={saving}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={formData.value}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          setFormData({
                            ...formData,
                            value
                          });
                        }
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{currentMetric.unit}</InputAdornment>,
                      }}
                      type="number"
                      inputProps={{
                        step: currentMetric.step,
                        min: currentMetric.min,
                        max: currentMetric.max
                      }}
                      disabled={saving}
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker 
                      label="Date"
                      value={formData.date}
                      onChange={handleDateChange}
                      disabled={saving}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          required: true,
                          disabled: saving
                        } 
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker 
                      label="Time"
                      value={formData.time}
                      onChange={handleTimeChange}
                      disabled={saving}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          required: true,
                          disabled: saving
                        } 
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Notes (optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add notes about this reading (optional)"
                    disabled={saving}
                  />
                </Grid>
              </Grid>

              <Box className="form-actions">
                <Button 
                  variant="outlined" 
                  onClick={() => navigate(`/health-metrics/${metricId}`)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={saving || success}
                >
                  {saving ? 'Saving...' : 'Save Reading'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </Grid>
    </Grid>
  );
};

export default MetricEntry; 