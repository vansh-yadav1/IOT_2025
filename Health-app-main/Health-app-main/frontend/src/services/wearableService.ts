import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Mock data for testing
const MOCK_MODE = false; // Set to true to always use mock data, false to try API first

export interface HealthDataSummary {
  user_id: string;
  period: string;
  start_date: string;
  end_date: string;
  heart_rate: {
    average_hr?: number;
    resting_hr?: number;
    max_hr?: number;
    min_hr?: number;
  };
  activity: {
    total_steps?: number;
    total_calories?: number;
    total_distance?: number;
    active_minutes?: number;
  };
  sleep: {
    average_duration?: number;
    average_efficiency?: number;
    average_deep_sleep?: number;
    average_rem_sleep?: number;
  };
  blood_oxygen: {
    average?: number;
    min?: number;
  };
}

export interface WearableDevice {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  connected_since?: string;
  last_sync?: string;
}

export interface HealthReport {
  user_id: string;
  report_id: string;
  report_period: {
    start_date: string;
    end_date: string;
    duration_days: number;
  };
  heart_rate: {
    average: number;
    resting: number;
    max: number;
    min: number;
  };
  activity: {
    total_steps: number;
    total_calories: number;
    total_distance: number;
    active_minutes: number;
  };
  sleep: {
    average_duration: number;
    average_efficiency: number;
    average_deep_sleep: number;
    average_rem_sleep: number;
  };
  blood_oxygen: {
    average: number;
    min: number;
  };
  generated_at: string;
}

// Mock data
const mockHealthSummary = (userId: string, period: string): HealthDataSummary => {
  return {
    user_id: userId,
    period: period,
    start_date: '2023-04-01',
    end_date: '2023-04-07',
    heart_rate: {
      average_hr: 72,
      resting_hr: 62,
      max_hr: 142,
      min_hr: 55
    },
    activity: {
      total_steps: 8540,
      total_calories: 420,
      total_distance: 6200, // In meters (6.2 km)
      active_minutes: 45
    },
    sleep: {
      average_duration: 420, // 7 hours in minutes
      average_efficiency: 0.85,
      average_deep_sleep: 110,
      average_rem_sleep: 90
    },
    blood_oxygen: {
      average: 98,
      min: 95
    }
  };
};

const mockDevices = (): WearableDevice[] => {
  return [
    {
      id: 'device-001',
      name: 'Apple Watch Series 7',
      type: 'Smartwatch',
      manufacturer: 'Apple',
      connected_since: '2023-01-15T10:30:00Z',
      last_sync: '2023-04-07T08:45:00Z'
    },
    {
      id: 'device-002',
      name: 'Fitbit Charge 5',
      type: 'Fitness Tracker',
      manufacturer: 'Fitbit',
      connected_since: '2023-02-20T14:15:00Z',
      last_sync: '2023-04-06T22:10:00Z'
    }
  ];
};

const mockTimeSeriesData = (type: string, days: number = 7) => {
  const now = new Date();
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    for (let h = 0; h < 24; h += 2) { // Every 2 hours
      const timestamp = new Date(date);
      timestamp.setHours(h);
      
      let value;
      switch (type) {
        case 'heart_rate':
          // Random heart rate between 60-100, with occasional higher values
          value = Math.floor(70 + Math.random() * 20 + (Math.random() > 0.9 ? 20 : 0));
          data.push({ timestamp: timestamp.toISOString(), bpm: value });
          break;
        case 'activity':
          // Random steps, increasing throughout the day
          value = Math.floor(500 * h/12 + Math.random() * 300);
          data.push({ timestamp: timestamp.toISOString(), steps: value });
          break;
        case 'sleep':
          // Only add sleep data for nighttime
          if (h >= 22 || h <= 8) {
            // Sleep quality between 0.7-1.0
            value = 0.7 + Math.random() * 0.3;
            data.push({ 
              timestamp: timestamp.toISOString(), 
              duration: Math.floor(6 + Math.random() * 3) * 60, // 6-9 hours in minutes
              efficiency: value
            });
          }
          break;
        case 'blood_oxygen':
          // Blood oxygen between 95-100
          value = 95 + Math.random() * 5;
          data.push({ timestamp: timestamp.toISOString(), value: value });
          break;
      }
    }
  }
  
  return data;
};

// Helper function to check if the API is available
const isApiAvailable = async (): Promise<boolean> => {
  if (MOCK_MODE) return false;
  
  try {
    // Try a simple API request to check if the backend is available
    await axios.get(`${API_URL}/`, { timeout: 2000 });
    return true;
  } catch (error) {
    console.log('API not available, using mock data');
    return false;
  }
};

export const getConnectionLink = async (userId: string): Promise<string> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      const response = await axios.get(`${API_URL}/wearable/connect/${userId}`);
      return response.data.link;
    }
  } catch (error) {
    console.log('Failed to get connection link from API, using mock data');
  }
  
  // Fall back to mock data
  return 'https://example.com/connect-device';
};

export const getUserDevices = async (userId: string): Promise<WearableDevice[]> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      const response = await axios.get(`${API_URL}/wearable/devices/${userId}`);
      return response.data;
    }
  } catch (error) {
    console.log('Failed to get user devices from API, using mock data');
  }
  
  // Fall back to mock data
  return mockDevices();
};

export const getConnectedSources = async (userId: string): Promise<any[]> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      const response = await axios.get(`${API_URL}/wearable/sources/${userId}`);
      return response.data;
    }
  } catch (error) {
    console.log('Failed to get connected sources from API, using mock data');
  }
  
  // Fall back to mock data
  return [
    { name: 'Apple Health', connected: true },
    { name: 'Fitbit', connected: true }
  ];
};

export const createVitalUser = async (clientUserId: string, profile: any): Promise<any> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      const response = await axios.post(`${API_URL}/wearable/users`, {
        client_user_id: clientUserId,
        profile
      });
      return response.data;
    }
  } catch (error) {
    console.log('Failed to create user from API, using mock data');
  }
  
  // Fall back to mock data
  return { 
    user_id: clientUserId,
    status: 'created'
  };
};

export const getHeartRateData = async (
  userId: string, 
  startDate?: string, 
  endDate?: string
): Promise<any> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      let url = `${API_URL}/wearable/data/heart-rate/${userId}`;
      if (startDate || endDate) {
        url += '?';
        if (startDate) url += `start_date=${startDate}`;
        if (startDate && endDate) url += '&';
        if (endDate) url += `end_date=${endDate}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    }
  } catch (error) {
    console.log('Failed to get heart rate data from API, using mock data');
  }
  
  // Fall back to mock data
  return {
    heart_rate_data: mockTimeSeriesData('heart_rate'),
    summary: {
      average_hr: 72,
      resting_hr: 62,
      max_hr: 142,
      min_hr: 55
    }
  };
};

export const getActivityData = async (
  userId: string, 
  startDate?: string, 
  endDate?: string
): Promise<any> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      let url = `${API_URL}/wearable/data/activity/${userId}`;
      if (startDate || endDate) {
        url += '?';
        if (startDate) url += `start_date=${startDate}`;
        if (startDate && endDate) url += '&';
        if (endDate) url += `end_date=${endDate}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    }
  } catch (error) {
    console.log('Failed to get activity data from API, using mock data');
  }
  
  // Fall back to mock data
  return {
    activity_data: mockTimeSeriesData('activity'),
    summary: {
      total_steps: 8540,
      total_calories: 420,
      total_distance: 6200,
      active_minutes: 45
    }
  };
};

export const getSleepData = async (
  userId: string, 
  startDate?: string, 
  endDate?: string
): Promise<any> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      let url = `${API_URL}/wearable/data/sleep/${userId}`;
      if (startDate || endDate) {
        url += '?';
        if (startDate) url += `start_date=${startDate}`;
        if (startDate && endDate) url += '&';
        if (endDate) url += `end_date=${endDate}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    }
  } catch (error) {
    console.log('Failed to get sleep data from API, using mock data');
  }
  
  // Fall back to mock data
  return {
    sleep_data: mockTimeSeriesData('sleep'),
    summary: {
      average_duration: 420, // 7 hours
      average_efficiency: 0.85,
      average_deep_sleep: 110,
      average_rem_sleep: 90
    }
  };
};

export const getBloodOxygenData = async (
  userId: string, 
  startDate?: string, 
  endDate?: string
): Promise<any> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      let url = `${API_URL}/wearable/data/blood-oxygen/${userId}`;
      if (startDate || endDate) {
        url += '?';
        if (startDate) url += `start_date=${startDate}`;
        if (startDate && endDate) url += '&';
        if (endDate) url += `end_date=${endDate}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    }
  } catch (error) {
    console.log('Failed to get blood oxygen data from API, using mock data');
  }
  
  // Fall back to mock data
  return {
    blood_oxygen_data: mockTimeSeriesData('blood_oxygen'),
    summary: {
      average: 98,
      min: 95
    }
  };
};

export const getHealthSummary = async (userId: string, period: string = 'week'): Promise<HealthDataSummary> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      const response = await axios.get(`${API_URL}/wearable/summary/${userId}?period=${period}`);
      return response.data;
    }
  } catch (error) {
    console.log('Failed to get health summary from API, using mock data');
  }
  
  // Fall back to mock data
  return mockHealthSummary(userId, period);
};

export const generateHealthReport = async (
  userId: string, 
  startDate?: string, 
  endDate?: string
): Promise<HealthReport> => {
  try {
    // Try to use the real API first
    if (await isApiAvailable()) {
      let url = `${API_URL}/wearable/report/${userId}`;
      if (startDate || endDate) {
        url += '?';
        if (startDate) url += `start_date=${startDate}`;
        if (startDate && endDate) url += '&';
        if (endDate) url += `end_date=${endDate}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    }
  } catch (error) {
    console.log('Failed to generate health report from API, using mock data');
  }
  
  // Fall back to mock data
  return {
    user_id: userId,
    report_id: `report-${Date.now()}`,
    report_period: {
      start_date: startDate || '2023-04-01',
      end_date: endDate || '2023-04-07',
      duration_days: 7
    },
    heart_rate: {
      average: 72,
      resting: 62,
      max: 142,
      min: 55
    },
    activity: {
      total_steps: 8540,
      total_calories: 420,
      total_distance: 6.2,
      active_minutes: 45
    },
    sleep: {
      average_duration: 7,
      average_efficiency: 0.85,
      average_deep_sleep: 1.8,
      average_rem_sleep: 1.5
    },
    blood_oxygen: {
      average: 98,
      min: 95
    },
    generated_at: new Date().toISOString()
  };
}; 