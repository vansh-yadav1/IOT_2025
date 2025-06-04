import axios from 'axios';
import api from './apiService';
import { format } from 'date-fns';
import { MetricDetail, MetricSummary, ReadingData, MetricFormData, MetricId } from '../types/health-metrics';

// Mock data for development until backend is ready
const mockMetricSummaries: MetricSummary[] = [
  {
    id: 'heart-rate',
    title: 'Heart Rate',
    icon: null, // Icons will be added in the component
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
    icon: null,
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
    icon: null,
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
    icon: null,
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

// Health Metrics Service
const healthMetricsService = {
  /**
   * Get all health metrics summaries
   */
  getMetricsSummaries: async (): Promise<MetricSummary[]> => {
    try {
      // Try to get data from API
      const response = await api.get('/api/metrics');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch metrics from API, using mock data', error);
      // Fall back to mock data
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(mockMetricSummaries);
        }, 800);
      });
    }
  },

  /**
   * Get detailed data for a specific health metric
   */
  getMetricDetail: async (metricId: MetricId): Promise<MetricDetail> => {
    try {
      // Try to get data from API
      const response = await api.get(`/api/metrics/${metricId}`);
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch metric ${metricId} from API, using mock data`, error);
      // Mock data for development
      return new Promise(resolve => {
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
            date: format(new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            notes: Math.random() > 0.7 ? 'After physical activity' : ''
          }));

          const mockMetric: MetricDetail = {
            id: metricId,
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
            description: `Your ${metricId.replace(/-/g, ' ')} readings over time. Track changes and identify patterns to better manage your health.`,
            lastUpdated: format(new Date(), 'MMM dd, yyyy HH:mm'),
            changeRate: Math.random() > 0.5 ? 2.5 : -1.8,
            icon: null, // Will be added in the component
            iconClass: `${metricId.split('-')[0]}-icon`,
            readings: mockReadings.sort((a, b) => 
              new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
            )
          };

          resolve(mockMetric);
        }, 1000);
      });
    }
  },

  /**
   * Get a specific reading by ID
   */
  getReading: async (metricId: MetricId, readingId: number): Promise<ReadingData> => {
    try {
      // Try to get data from API
      const response = await api.get(`/api/metrics/${metricId}/readings/${readingId}`);
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch reading ${readingId} from API, using mock data`, error);
      // Mock data for development
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: readingId,
            value: metricId === 'heart-rate' 
              ? Math.floor(Math.random() * 30) + 60 
              : metricId === 'blood-pressure' 
                ? Math.floor(Math.random() * 40) + 110
                : metricId === 'oxygen-level'
                  ? Math.floor(Math.random() * 5) + 94
                  : Math.floor(Math.random() * 2) + 36,
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm'),
            notes: 'Sample reading notes'
          });
        }, 600);
      });
    }
  },

  /**
   * Create a new health metric reading
   */
  createReading: async (metricId: MetricId, data: MetricFormData): Promise<ReadingData> => {
    try {
      // Try to send data to API
      const response = await api.post(`/api/metrics/${metricId}/readings`, data);
      return response.data;
    } catch (error) {
      console.warn(`Failed to create reading in API, using mock data`, error);
      // Mock data for development
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: Math.floor(Math.random() * 1000),
            value: data.value,
            date: format(data.date, 'yyyy-MM-dd'),
            time: format(data.time, 'HH:mm'),
            notes: data.notes
          });
        }, 800);
      });
    }
  },

  /**
   * Update an existing health metric reading
   */
  updateReading: async (metricId: MetricId, readingId: number, data: MetricFormData): Promise<ReadingData> => {
    try {
      // Try to update data in API
      const response = await api.put(`/api/metrics/${metricId}/readings/${readingId}`, data);
      return response.data;
    } catch (error) {
      console.warn(`Failed to update reading ${readingId} in API, using mock data`, error);
      // Mock data for development
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: readingId,
            value: data.value,
            date: format(data.date, 'yyyy-MM-dd'),
            time: format(data.time, 'HH:mm'),
            notes: data.notes
          });
        }, 800);
      });
    }
  },

  /**
   * Delete a health metric reading
   */
  deleteReading: async (metricId: MetricId, readingId: number): Promise<void> => {
    try {
      // Try to delete from API
      await api.delete(`/api/metrics/${metricId}/readings/${readingId}`);
      return;
    } catch (error) {
      console.warn(`Failed to delete reading ${readingId} from API, using mock`, error);
      // Mock for development
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 600);
      });
    }
  }
};

export default healthMetricsService; 