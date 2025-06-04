import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Skeleton,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import { 
  Add, 
  TrendingUp, 
  TrendingDown, 
  FavoriteOutlined, 
  OpacityOutlined, 
  AirOutlined, 
  ThermostatOutlined,
  ArrowForward
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useNotification } from '../../context/NotificationContext';
import './HealthMetrics.css';
import MetricsSidebar from '../../components/health-metrics/MetricsSidebar';
import { useTheme } from '@mui/material/styles';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock data for the dashboard
const mockMetrics = [
  {
    id: 'heart-rate',
    title: 'Heart Rate',
    icon: <FavoriteOutlined />,
    iconClass: 'heart-icon',
    unit: 'bpm',
    current: 72,
    trend: -3,
    normalRange: '60-100',
    chartData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Heart Rate',
          data: [75, 72, 78, 70, 74, 72, 72],
          borderColor: '#e91e63',
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  },
  {
    id: 'blood-pressure',
    title: 'Blood Pressure',
    icon: <OpacityOutlined />,
    iconClass: 'blood-icon',
    unit: 'mmHg',
    current: '120/80',
    trend: -5,
    normalRange: '≤120/≤80',
    chartData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Systolic',
          data: [125, 122, 120, 118, 125, 123, 120],
          borderColor: '#1e88e5',
          backgroundColor: 'rgba(30, 136, 229, 0.0)',
          tension: 0.4
        },
        {
          label: 'Diastolic',
          data: [85, 83, 80, 82, 85, 82, 80],
          borderColor: '#42a5f5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  },
  {
    id: 'oxygen-level',
    title: 'Oxygen Level',
    icon: <AirOutlined />,
    iconClass: 'oxygen-icon',
    unit: '%',
    current: 98,
    trend: 1,
    normalRange: '95-100',
    chartData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'SpO2',
          data: [97, 96, 98, 97, 99, 98, 98],
          borderColor: '#43a047',
          backgroundColor: 'rgba(67, 160, 71, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  },
  {
    id: 'body-temperature',
    title: 'Body Temperature',
    icon: <ThermostatOutlined />,
    iconClass: 'temperature-icon',
    unit: '°C',
    current: 36.6,
    trend: 0.2,
    normalRange: '36.1-37.2',
    chartData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Temperature',
          data: [36.8, 36.5, 36.6, 36.7, 36.5, 36.4, 36.6],
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  }
];

const HealthDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API call to fetch metrics
    const fetchMetrics = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setMetrics(mockMetrics);
          setLoading(false);
        }, 800);
      } catch (error) {
        showNotification('Error fetching health metrics', 'error');
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [showNotification]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp fontSize="small" className="trend-up" />;
    } else if (trend < 0) {
      return <TrendingDown fontSize="small" className="trend-down" />;
    }
    return null;
  };

  const getChartOptions = (title: string) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
        },
      },
      scales: {
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            color: theme.palette.divider,
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      elements: {
        line: {
          tension: 0.4,
        },
        point: {
          radius: 3,
        },
      },
    };
  };

  if (loading) {
    return (
      <Container className="health-dashboard-container">
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">Health Metrics</Typography>
          <Skeleton variant="rectangular" width={150} height={40} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" height={280} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Grid container sx={{ height: '100%' }}>
      <Grid item xs={12} md={3} lg={2.5} sx={{ display: { xs: 'none', md: 'block' } }}>
        <MetricsSidebar />
      </Grid>
      <Grid item xs={12} md={9} lg={9.5}>
        <Container className="health-dashboard-container">
          <Box mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Health Metrics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and monitor your vital signs and health metrics over time.
            </Typography>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2">Recent Readings</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => {
                if (metrics.length > 0) {
                  navigate(`/health-metrics/${metrics[0].id}/add`);
                } else {
                  navigate(`/health-metrics/heart-rate/add`);
                }
              }}
            >
              New Reading
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {metrics.map((metric) => (
                  <Grid item xs={12} md={6} key={metric.id}>
                    <Card className="metric-card">
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Box className={`metric-icon ${metric.iconClass}`} mr={1}>
                            {metric.icon}
                          </Box>
                          <Typography variant="h6" component="h2">
                            {metric.title}
                          </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={2}>
                          <Box display="flex" alignItems="baseline">
                            <Typography variant="h4" component="p" className="metric-value">
                              {metric.current}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                              {metric.unit}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center">
                            {getTrendIcon(metric.trend)}
                            <Typography 
                              variant="body2" 
                              className={metric.trend > 0 ? "trend-up" : (metric.trend < 0 ? "trend-down" : "")}
                              sx={{ ml: 0.5 }}
                            >
                              {Math.abs(metric.trend)}{metric.unit}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Normal range: {metric.normalRange} {metric.unit}
                        </Typography>

                        <Box className="chart-container" sx={{ height: 120, mt: 2 }}>
                          <Line 
                            data={metric.chartData} 
                            options={getChartOptions(metric.title)} 
                          />
                        </Box>
                      </CardContent>
                      
                      <Divider />
                      
                      <CardActions className="card-actions">
                        <Button 
                          size="small" 
                          color="primary"
                          endIcon={<ArrowForward />}
                          onClick={() => navigate(`/health-metrics/${metric.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small"
                          onClick={() => navigate(`/health-metrics/${metric.id}/add`)}
                        >
                          Add Reading
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>
      </Grid>
    </Grid>
  );
};

export default HealthDashboard; 