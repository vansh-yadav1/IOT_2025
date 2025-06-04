import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, MenuItem } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

const HealthTracking: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [newMetric, setNewMetric] = useState({
    type: '',
    value: '',
    unit: '',
    notes: ''
  });

  const metricTypes = [
    { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
    { value: 'temperature', label: 'Temperature', unit: '°C' },
    { value: 'weight', label: 'Weight', unit: 'kg' },
    { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL' }
  ];

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching metrics:', error);
    } else {
      setMetrics(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('health_metrics')
      .insert([
        {
          user_id: user.id,
          type: newMetric.type,
          value: parseFloat(newMetric.value),
          unit: newMetric.unit,
          notes: newMetric.notes,
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error adding metric:', error);
    } else {
      setNewMetric({ type: '', value: '', unit: '', notes: '' });
      fetchMetrics();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Health Metrics Tracking
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Metric Type"
                value={newMetric.type}
                onChange={(e) => {
                  const selected = metricTypes.find(m => m.value === e.target.value);
                  setNewMetric({
                    ...newMetric,
                    type: e.target.value,
                    unit: selected?.unit || ''
                  });
                }}
              >
                {metricTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Value"
                type="number"
                value={newMetric.value}
                onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Notes"
                value={newMetric.notes}
                onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Add Metric
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Recent Metrics
      </Typography>

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} key={metric.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">
                {metricTypes.find(m => m.value === metric.type)?.label || metric.type}
              </Typography>
              <Typography variant="body1">
                {metric.value} {metric.unit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(metric.timestamp).toLocaleString()}
              </Typography>
              {metric.notes && (
                <Typography variant="body2" color="text.secondary">
                  Notes: {metric.notes}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HealthTracking; 