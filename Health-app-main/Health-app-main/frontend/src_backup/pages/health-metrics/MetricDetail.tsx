import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Skeleton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Add as AddIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Favorite as HeartIcon,
  Bloodtype as BloodIcon,
  AirOutlined as OxygenIcon,
  Thermostat as TemperatureIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterAlt as FilterIcon,
  DateRange as DateRangeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './HealthMetrics.css';
import MetricsSidebar from '../../components/health-metrics/MetricsSidebar';

// Interfaces
interface ReadingData {
  id: number;
  value: number;
  date: string;
  time: string;
  notes: string;
}

interface MetricDetail {
  id: string;
  name: string;
  currentValue: number;
  unit: string;
  normalRange: string;
  description: string;
  lastUpdated: string;
  changeRate: number;
  icon: React.ReactNode;
  iconClass: string;
  readings: ReadingData[];
}

const MetricDetail: React.FC = () => {
  const { metricId } = useParams<{ metricId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<MetricDetail | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [filteredReadings, setFilteredReadings] = useState<ReadingData[]>([]);
  const [chartTimeframe, setChartTimeframe] = useState('week');

  // Icons mapping
  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'heart-rate':
        return { icon: <HeartIcon />, className: 'heart-icon' };
      case 'blood-pressure':
        return { icon: <BloodIcon />, className: 'blood-icon' };
      case 'oxygen-level':
        return { icon: <OxygenIcon />, className: 'oxygen-icon' };
      case 'body-temperature':
        return { icon: <TemperatureIcon />, className: 'temperature-icon' };
      default:
        return { icon: <HeartIcon />, className: 'heart-icon' };
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    const fetchMetricData = async () => {
      // Simulate API call
      setLoading(true);
      setTimeout(() => {
        const mockReadings: ReadingData[] = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          value: metricId === 'heart-rate' 
            ? Math.floor(Math.random() * 30) + 60 
            : metricId === 'blood-pressure' 
              ? Math.floor(Math.random() * 40) + 110
              : metricId === 'oxygen-level'
                ? Math.floor(Math.random() * 5) + 94
                : Math.floor(Math.random() * 2) + 36,
          date: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
          time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          notes: Math.random() > 0.7 ? 'After physical activity' : ''
        }));

        const iconData = getMetricIcon(metricId || '');
        
        const mockMetric: MetricDetail = {
          id: metricId || '',
          name: metricId === 'heart-rate' 
            ? 'Heart Rate' 
            : metricId === 'blood-pressure' 
              ? 'Blood Pressure'
              : metricId === 'oxygen-level'
                ? 'Oxygen Level'
                : 'Body Temperature',
          currentValue: mockReadings[0].value,
          unit: metricId === 'heart-rate' 
            ? 'bpm' 
            : metricId === 'blood-pressure' 
              ? 'mmHg'
              : metricId === 'oxygen-level'
                ? '%'
                : '°C',
          normalRange: metricId === 'heart-rate' 
            ? '60-100 bpm' 
            : metricId === 'blood-pressure' 
              ? '120/80 mmHg'
              : metricId === 'oxygen-level'
                ? '95-100%'
                : '36.1-37.2°C',
          description: `Your ${metricId?.replace('-', ' ')} readings over time. Track changes and identify patterns to better manage your health.`,
          lastUpdated: format(new Date(), 'MMM dd, yyyy HH:mm'),
          changeRate: Math.random() > 0.5 ? 2.5 : -1.8,
          icon: iconData.icon,
          iconClass: iconData.className,
          readings: mockReadings.sort((a, b) => 
            new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()
          )
        };

        setMetric(mockMetric);
        setLoading(false);
      }, 1200);
    };

    fetchMetricData();
  }, [metricId]);

  // Apply date filters to readings
  useEffect(() => {
    if (metric) {
      const filtered = metric.readings.filter((reading: ReadingData) => {
        const readingDate = parseISO(`${reading.date}T${reading.time}`);
        const isAfterStart = startDate ? isAfter(readingDate, startDate) || readingDate.getTime() === startDate.getTime() : true;
        const isBeforeEnd = endDate ? isBefore(readingDate, endDate) || readingDate.getTime() === endDate.getTime() : true;
        return isAfterStart && isBeforeEnd;
      });
      setFilteredReadings(filtered);
    }
  }, [metric, startDate, endDate]);

  // Handle pagination changes
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Chart data preparation
  const getChartData = () => {
    if (!metric) return null;

    let timeframe = 7; // default to week
    if (chartTimeframe === 'month') timeframe = 30;
    if (chartTimeframe === 'year') timeframe = 365;

    // Get readings for the timeframe and group by date
    const cutoffDate = subDays(new Date(), timeframe);
    const recentReadings = metric.readings
      .filter((reading: ReadingData) => isAfter(parseISO(reading.date), cutoffDate))
      .sort((a: ReadingData, b: ReadingData) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    // Group by date and average values
    const groupedByDate: Record<string, number[]> = {};
    recentReadings.forEach((reading: ReadingData) => {
      if (!groupedByDate[reading.date]) {
        groupedByDate[reading.date] = [];
      }
      groupedByDate[reading.date].push(reading.value);
    });

    const labels = Object.keys(groupedByDate).sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime());
    const data = labels.map(date => {
      const values = groupedByDate[date];
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    });

    return {
      labels: labels.map(date => format(parseISO(date), 'MMM dd')),
      datasets: [
        {
          label: metric.name,
          data: data,
          borderColor: metricId === 'heart-rate' 
            ? '#e91e63' 
            : metricId === 'blood-pressure' 
              ? '#1e88e5'
              : metricId === 'oxygen-level'
                ? '#43a047'
                : '#ff9800',
          backgroundColor: metricId === 'heart-rate' 
            ? 'rgba(233, 30, 99, 0.1)' 
            : metricId === 'blood-pressure' 
              ? 'rgba(30, 136, 229, 0.1)'
              : metricId === 'oxygen-level'
                ? 'rgba(67, 160, 71, 0.1)'
                : 'rgba(255, 152, 0, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.3,
          fill: true
        }
      ]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const handleDeleteReading = (id: number) => {
    // In a real app, this would make an API call
    if (metric) {
      const updatedReadings = metric.readings.filter((reading: ReadingData) => reading.id !== id);
      setMetric({
        ...metric,
        readings: updatedReadings
      });
    }
  };

  const handleAddReading = () => {
    navigate(`/health-metrics/${metricId}/add`);
  };

  return (
    <Grid container sx={{ height: '100%' }}>
      <Grid item xs={12} md={3} lg={2.5} sx={{ display: { xs: 'none', md: 'block' } }}>
        <MetricsSidebar />
      </Grid>
      <Grid item xs={12} md={9} lg={9.5}>
        <Container className="metric-detail-container">
          {loading ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                <Skeleton variant="text" width={200} height={40} />
              </Box>
              <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={300} />
            </>
          ) : metric ? (
            <>
              <Box className="metric-detail-header">
                <Button 
                  startIcon={<ChevronLeftIcon />} 
                  onClick={() => navigate('/health-metrics')}
                  sx={{ mr: 2 }}
                >
                  Back
                </Button>
                <Box 
                  className={`metric-detail-icon ${metric.iconClass}`}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {metric.icon}
                </Box>
                <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
                  {metric.name}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={handleAddReading}
                  sx={{ ml: 2 }}
                >
                  Add Reading
                </Button>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card className="detail-card">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Current Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                        <Typography variant="h3" component="div" sx={{ mr: 1 }}>
                          {metric.currentValue}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          {metric.unit}
                        </Typography>
                        {metric.changeRate > 0 ? (
                          <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                            <ArrowUpwardIcon fontSize="small" />
                            {Math.abs(metric.changeRate)}%
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                            <ArrowDownwardIcon fontSize="small" />
                            {Math.abs(metric.changeRate)}%
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          Normal range:
                        </Typography>
                        <Typography variant="body2">
                          {metric.normalRange}
                        </Typography>
                        <Tooltip title="This is the healthy range for most adults. Individual ranges may vary based on personal health conditions.">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Last updated: {metric.lastUpdated}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card className="detail-card">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        About {metric.name}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {metric.description}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        {metricId === 'heart-rate' && 'Your heart rate measures how many times your heart beats per minute. Resting heart rate for adults typically ranges from 60 to 100 beats per minute.'}
                        {metricId === 'blood-pressure' && 'Blood pressure is the pressure of circulating blood against the walls of blood vessels. It is expressed as systolic/diastolic pressure, with normal being around 120/80 mmHg.'}
                        {metricId === 'oxygen-level' && 'Blood oxygen level (SpO2) measures the percentage of oxygen in your blood. Normal levels are typically between 95% and 100%.'}
                        {metricId === 'body-temperature' && 'Body temperature is a measure of the body\'s ability to generate and get rid of heat. The normal body temperature is 36.1°C to 37.2°C.'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box className="chart-settings">
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {metric.name} History
                    </Typography>
                    <TextField
                      select
                      value={chartTimeframe}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChartTimeframe(e.target.value)}
                      size="small"
                      label="Timeframe"
                      sx={{ width: 150 }}
                    >
                      <MenuItem value="week">Last Week</MenuItem>
                      <MenuItem value="month">Last Month</MenuItem>
                      <MenuItem value="year">Last Year</MenuItem>
                    </TextField>
                  </Box>
                  <Box className="metrics-chart">
                    {getChartData() ? (
                      <Line data={getChartData() as any} options={chartOptions} />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body1" color="text.secondary">
                          No data available for selected timeframe
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    All Readings
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Export data">
                      <IconButton>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print">
                      <IconButton>
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box className="range-filters">
                  <FilterIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Filter by date:
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker 
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue: Date | null) => setStartDate(newValue)}
                      slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
                    />
                    <Box sx={{ mx: 1 }}>to</Box>
                    <DatePicker 
                      label="End Date"
                      value={endDate}
                      onChange={(newValue: Date | null) => setEndDate(newValue)}
                      slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
                    />
                  </LocalizationProvider>
                </Box>

                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReadings.length > 0 ? (
                        filteredReadings
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((reading: ReadingData) => (
                          <TableRow key={reading.id}>
                            <TableCell>{format(parseISO(reading.date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{reading.time}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {reading.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                  {metric.unit}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{reading.notes}</TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => navigate(`/health-metrics/${metricId}/edit/${reading.id}`)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteReading(reading.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No readings found for the selected date range
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredReadings.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <Typography variant="h6" color="text.secondary">
                Metric not found
              </Typography>
            </Box>
          )}
        </Container>
      </Grid>
    </Grid>
  );
};

export default MetricDetail; 