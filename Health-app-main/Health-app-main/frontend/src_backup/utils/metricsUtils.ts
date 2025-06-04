import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { ReadingData, MetricId } from '../types/health-metrics';

/**
 * Format date for display
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format time for display
 */
export const formatTime = (timeString: string, formatStr: string = 'hh:mm a'): string => {
  try {
    // Handle time-only strings by appending a date
    const dateTimeString = timeString.includes('T') 
      ? timeString 
      : `2000-01-01T${timeString}`;
    
    return format(parseISO(dateTimeString), formatStr);
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Filter readings by date range
 */
export const filterReadingsByDateRange = (
  readings: ReadingData[],
  startDate: Date | null,
  endDate: Date | null
): ReadingData[] => {
  if (!startDate && !endDate) return readings;
  
  return readings.filter(reading => {
    const readingDate = parseISO(`${reading.date}T${reading.time}`);
    const isAfterStart = startDate 
      ? isAfter(readingDate, startDate) || readingDate.getTime() === startDate.getTime() 
      : true;
    const isBeforeEnd = endDate 
      ? isBefore(readingDate, endDate) || readingDate.getTime() === endDate.getTime() 
      : true;
    
    return isAfterStart && isBeforeEnd;
  });
};

/**
 * Get color scheme for a specific metric
 */
export const getMetricColors = (metricId: MetricId) => {
  switch (metricId) {
    case 'heart-rate':
      return {
        primary: '#e91e63',
        background: 'rgba(233, 30, 99, 0.1)',
        hover: 'rgba(233, 30, 99, 0.2)',
        light: '#f48fb1'
      };
    case 'blood-pressure':
      return {
        primary: '#1e88e5',
        background: 'rgba(30, 136, 229, 0.1)',
        hover: 'rgba(30, 136, 229, 0.2)',
        light: '#90caf9'
      };
    case 'oxygen-level':
      return {
        primary: '#43a047',
        background: 'rgba(67, 160, 71, 0.1)',
        hover: 'rgba(67, 160, 71, 0.2)',
        light: '#a5d6a7'
      };
    case 'body-temperature':
      return {
        primary: '#ff9800',
        background: 'rgba(255, 152, 0, 0.1)',
        hover: 'rgba(255, 152, 0, 0.2)',
        light: '#ffcc80'
      };
    default:
      return {
        primary: '#3498db',
        background: 'rgba(52, 152, 219, 0.1)',
        hover: 'rgba(52, 152, 219, 0.2)',
        light: '#90caf9'
      };
  }
};

/**
 * Check if a value is within normal range
 */
export const isWithinNormalRange = (
  value: number | string,
  normalRange: string,
  metricId: MetricId
): boolean => {
  try {
    // Handle blood pressure separately
    if (metricId === 'blood-pressure' && typeof value === 'string') {
      const [systolic, diastolic] = value.split('/').map(Number);
      const [normalSystolic, normalDiastolic] = normalRange
        .replace('≤', '')
        .split('/')
        .map(val => parseInt(val.trim(), 10));
      
      return systolic <= normalSystolic && diastolic <= normalDiastolic;
    }
    
    // Handle numeric ranges for other metrics
    if (typeof value === 'number') {
      const [min, max] = normalRange
        .replace(/[^\d.-]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(Number);
      
      return value >= min && value <= max;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking normal range:', error);
    return true;
  }
};

/**
 * Calculate the average of readings
 */
export const calculateAverage = (readings: ReadingData[]): number => {
  if (!readings.length) return 0;
  
  const validReadings = readings.filter(r => typeof r.value === 'number');
  if (!validReadings.length) return 0;
  
  const sum = validReadings.reduce((acc, reading) => {
    return acc + (reading.value as number);
  }, 0);
  
  return parseFloat((sum / validReadings.length).toFixed(1));
};

/**
 * Calculate trend percentage between current and previous readings
 */
export const calculateTrend = (
  currentValue: number | string,
  previousValue: number | string
): number => {
  if (typeof currentValue === 'string' || typeof previousValue === 'string') {
    return 0; // Complex types like blood pressure aren't supported
  }
  
  if (previousValue === 0) return 0;
  
  const change = currentValue - previousValue;
  const percentage = (change / previousValue) * 100;
  
  return parseFloat(percentage.toFixed(1));
};

/**
 * Get formatted name for a metric ID
 */
export const getMetricName = (metricId: MetricId | string): string => {
  switch (metricId) {
    case 'heart-rate': return 'Heart Rate';
    case 'blood-pressure': return 'Blood Pressure';
    case 'oxygen-level': return 'Oxygen Level';
    case 'body-temperature': return 'Body Temperature';
    default: return metricId.replace(/-/g, ' ');
  }
};

/**
 * Get unit for a specific metric
 */
export const getMetricUnit = (metricId: MetricId | string): string => {
  switch (metricId) {
    case 'heart-rate': return 'bpm';
    case 'blood-pressure': return 'mmHg';
    case 'oxygen-level': return '%';
    case 'body-temperature': return '°C';
    default: return '';
  }
};

/**
 * Get normal range for a metric
 */
export const getNormalRange = (metricId: MetricId | string): string => {
  switch (metricId) {
    case 'heart-rate': return '60-100 bpm';
    case 'blood-pressure': return '≤120/≤80 mmHg';
    case 'oxygen-level': return '95-100%';
    case 'body-temperature': return '36.1-37.2°C';
    default: return '';
  }
};

/**
 * Get formatted title for a metric ID
 */
export const getMetricTitle = (metricId: string): string => {
  switch (metricId) {
    case 'heart-rate': return 'Heart Rate';
    case 'blood-pressure': return 'Blood Pressure';
    case 'oxygen-level': return 'Oxygen Level';
    case 'body-temperature': return 'Body Temperature';
    default: return metricId ? metricId.replace(/-/g, ' ') : 'Unknown Metric';
  }
}; 