import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider, TextField, Button, CircularProgress } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getHealthSummary } from '../services/wearableService';
import TestHealthReportSaver from '../components/TestHealthReportSaver';
import { TestHealthReport } from '../types/reports';
import AddIcon from '@mui/icons-material/NoteAdd';

// Types
type TimeLabel = 'start' | 'half-life' | 'full-life';

interface HealthDataPoint {
  time: TimeLabel;
  minutes: number;
  timestamp: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  o2: number;
  respirationRate: number;
}

const timeLabels: Record<TimeLabel, string> = {
  'start': 'Start',
  'half-life': 'Half-life',
  'full-life': 'Full-life',
};

const metricColors: Record<string, string> = {
  heartRate: '#8884d8',
  systolic: '#82ca9d',
  diastolic: '#ffc658',
  temperature: '#ff9800',
  o2: '#2196f3',
};

const TestHealth: React.FC = () => {
  const { user } = useAuth();
  const [medicine, setMedicine] = useState('');
  const [halfLife, setHalfLife] = useState('');
  const [fullLife, setFullLife] = useState('');
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HealthDataPoint[]>([]);
  const [elapsed, setElapsed] = useState(0); // seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [collected, setCollected] = useState<{ [key in TimeLabel]?: boolean }>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [saveRequested, setSaveRequested] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);

  // Fetch health data from API with simulated variation for demo
  const fetchHealthData = async (minutes: number): Promise<Omit<HealthDataPoint, 'time' | 'minutes' | 'timestamp'>> => {
    if (!user?.id) throw new Error('User not found');
    const summary = await getHealthSummary(user.id, 'day');
    // Clamp values to the specified ranges
    const heartRate = Math.max(60, Math.min(100, Math.round((summary.heart_rate?.average_hr || 70) + (Math.random() - 0.5) * 20)));
    const systolic = Math.max(90, Math.min(120, Math.round(120 + (Math.random() - 0.5) * 20)));
    const diastolic = Math.max(60, Math.min(80, Math.round(80 + (Math.random() - 0.5) * 10)));
    const temperature = Math.max(36.1, Math.min(37.2, 36.7 + (Math.random() - 0.5) * 0.5)); // Temperature clamped to 36.1°C – 37.2°C
    const o2 = Math.max(95, Math.min(100, Math.round((summary.blood_oxygen?.average || 98) + (Math.random() - 0.5) * 5)));
    const respirationRate = Math.max(12, Math.min(20, Math.round(16 + (Math.random() - 0.5) * 8))); // Respiration rate between 12 and 20 breaths/minute
    return {
      heartRate,
      systolic,
      diastolic,
      temperature,
      o2,
      respirationRate
    };
  };

  // Reset all state
  const resetTracking = () => {
    setTracking(false);
    setLoading(false);
    setError(null);
    setData([]);
    setElapsed(0);
    setCollected({});
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Start tracking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetTracking();
    const half = parseInt(halfLife, 10);
    const full = parseInt(fullLife, 10);
    if (!medicine || isNaN(half) || isNaN(full) || half <= 0 || full <= 0 || half >= full) {
      setError('Please enter valid medicine name, half-life, and full-life (half-life < full-life, both > 0).');
      return;
    }
    setTracking(true);
    setLoading(true);
    setError(null);
    const now = new Date();
    setStartTime(now); // Record the start time
    // Collect start data immediately (only start point)
    try {
      const startData = await fetchHealthData(0);
      setData([{
        time: 'start',
        minutes: 0,
        timestamp: now.toLocaleTimeString(),
        ...startData,
      }]);
      setCollected({ start: true });
    } catch (err) {
      setError('Failed to fetch health data.');
      setTracking(false);
      setLoading(false);
      return;
    }
    setLoading(false);
    setElapsed(0);
    // Start timer
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  };

  // Handle data collection at half-life and full-life
  useEffect(() => {
    if (!tracking) return;
    const half = parseInt(halfLife, 10);
    const full = parseInt(fullLife, 10);
    // Only collect half-life if not already collected and at the right time
    if (elapsed === half * 60 && !collected['half-life']) {
      setLoading(true);
      let timestamp = new Date().toLocaleTimeString();
      if (startTime) {
        const halfLifeTarget = new Date(startTime.getTime() + half * 60 * 1000);
        timestamp = halfLifeTarget.toLocaleTimeString();
      }
      fetchHealthData(half).then(halfData => {
        setData(prev => ([
          ...prev,
          {
            time: 'half-life',
            minutes: half,
            timestamp, // Use the calculated timestamp
            ...halfData,
          },
        ]));
        setCollected(prev => ({ ...prev, ['half-life']: true }));
        setLoading(false);
      });
    }
    // Only collect full-life if not already collected and at the right time
    if (elapsed === full * 60 && !collected['full-life']) {
      setLoading(true);
      let timestamp = new Date().toLocaleTimeString();
      if (startTime) {
        const fullLifeTarget = new Date(startTime.getTime() + full * 60 * 1000);
        timestamp = fullLifeTarget.toLocaleTimeString();
      }
      fetchHealthData(full).then(fullData => {
        setData(prev => ([
          ...prev,
          {
            time: 'full-life',
            minutes: full,
            timestamp, // Use the calculated timestamp
            ...fullData,
          },
        ]));
        setCollected(prev => ({ ...prev, ['full-life']: true }));
        setLoading(false);
        setTracking(false);
        if (timerRef.current) clearInterval(timerRef.current);
      });
    }
  }, [elapsed, tracking]); // Only depend on elapsed and tracking

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sort data by minutes for chart
  const sortedData = [...data].sort((a, b) => a.minutes - b.minutes);

  // Format elapsed time as mm:ss
  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Download report as CSV
  const handleDownloadReport = () => {
    if (!data.length) return;
    // Prepare CSV header
    const header = [
      'Time Point',
      'Timestamp',
      'Minutes',
      'Heart Rate',
      'Systolic BP',
      'Diastolic BP',
      'Temperature',
      'O2 Saturation',
    ];
    // Prepare CSV rows
    const rows = data.map(d => [
      d.time,
      d.timestamp,
      d.minutes,
      d.heartRate,
      d.systolic,
      d.diastolic,
      d.temperature,
      d.o2,
    ]);
    // Combine header and rows
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare TestHealthReport object for saving
  const testHealthReport: TestHealthReport | null =
    !tracking && data.length === 3 && user && !reportSaved
      ? {
          id: `${user.id}-${Date.now()}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
          medicine,
          half_life: Number(halfLife),
          full_life: Number(fullLife),
          data,
        }
      : null;

  return (
    <Box sx={{ p: 4, position: 'relative' }}>
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Tracking</Typography>
      {/* Input Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Medicine Name"
                value={medicine}
                onChange={e => setMedicine(e.target.value)}
                fullWidth
                required
                disabled={tracking}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Half-life (minutes)"
                type="number"
                value={halfLife}
                onChange={e => setHalfLife(e.target.value)}
                fullWidth
                required
                disabled={tracking}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Full-life (minutes)"
                type="number"
                value={fullLife}
                onChange={e => setFullLife(e.target.value)}
                fullWidth
                required
                disabled={tracking}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={tracking || loading}>
                {loading && !data.length ? <CircularProgress size={24} /> : 'Start Tracking'}
              </Button>
            </Grid>
          </Grid>
        </form>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </Paper>
      {/* Live/Simulated Data Visualization */}
      {data.length > 0 && (
        <>
          {/* Report content to capture */}
          <div ref={reportRef}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sortedData} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="minutes" label={{ value: 'Minutes', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke={metricColors.heartRate} />
                  <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke={metricColors.systolic} />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke={metricColors.diastolic} />
                  <Line type="monotone" dataKey="temperature" name="Temperature" stroke={metricColors.temperature} />
                  <Line type="monotone" dataKey="o2" name="O2 Saturation" stroke={metricColors.o2} />
                  {/* Always show a vertical reference line at half-life */}
                  {halfLife && !isNaN(Number(halfLife)) && (
                    <ReferenceLine x={parseInt(halfLife, 10)} stroke="purple" strokeDasharray="3 3" label={{ value: 'Half-life', position: 'top', fill: 'purple' }} />
                  )}
                  {/* Optionally, show a vertical reference line at full-life */}
                  {fullLife && !isNaN(Number(fullLife)) && (
                    <ReferenceLine x={parseInt(fullLife, 10)} stroke="#888" strokeDasharray="3 3" label={{ value: 'Full-life', position: 'top', fill: '#888' }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Paper>
            <Typography variant="h6" gutterBottom>Data Summary</Typography>
            <Grid container spacing={2}>
              {(['start', 'half-life', 'full-life'] as TimeLabel[]).map((label) => {
                const point = data.find(d => d.time === label);
                return (
                  <Grid item xs={12} md={4} key={label}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{timeLabels[label]}</Typography>
                      {point ? (
                        <>
                          <Typography variant="body2">Timestamp: {point.timestamp}</Typography>
                          <Typography variant="body2">Minutes: {point.minutes}</Typography>
                          <Typography variant="body2">Heart Rate: {point.heartRate} bpm</Typography>
                          <Typography variant="body2">Temperature: {point.temperature.toFixed(1)}°C</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">BP: {point.systolic}/{point.diastolic} mmHg</Typography>
                          <Typography variant="body2">O2 Sat: {point.o2}%</Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Pending...</Typography>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </div>
          {/* Save Data Button below data summary */}
          {testHealthReport && !reportSaved && (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setSaveRequested(true)}
                disabled={saveRequested}
              >
                {saveRequested ? 'Saving...' : 'Save Data'}
              </Button>
            </Box>
          )}
          {/* Save logic triggered by button */}
          {testHealthReport && saveRequested && !reportSaved && reportRef.current && (
            <TestHealthReportSaver
              report={testHealthReport}
              reportElementRef={reportRef}
              onSaveComplete={() => {
                setReportSaved(true);
                setSaveRequested(false);
              }}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default TestHealth; 