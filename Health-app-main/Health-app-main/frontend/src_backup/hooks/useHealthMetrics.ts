import { useState, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import healthMetricsService from '../services/healthMetricsService';
import { MetricDetail, MetricSummary, ReadingData, MetricFormData, MetricId } from '../types/health-metrics';

/**
 * Custom hook for health metrics functionality
 */
export const useHealthMetrics = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<MetricSummary[]>([]);
  const [currentMetric, setCurrentMetric] = useState<MetricDetail | null>(null);
  const [currentReading, setCurrentReading] = useState<ReadingData | null>(null);

  /**
   * Fetch all metrics summaries
   */
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await healthMetricsService.getMetricsSummaries();
      setMetrics(data);
      return data;
    } catch (error) {
      showNotification('Error fetching health metrics', 'error');
      console.error('Error fetching health metrics:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  /**
   * Fetch a specific metric's details
   */
  const fetchMetricDetail = useCallback(async (metricId: MetricId) => {
    setLoading(true);
    try {
      const data = await healthMetricsService.getMetricDetail(metricId);
      setCurrentMetric(data);
      return data;
    } catch (error) {
      showNotification(`Error fetching ${metricId} details`, 'error');
      console.error(`Error fetching ${metricId} details:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  /**
   * Fetch a specific reading
   */
  const fetchReading = useCallback(async (metricId: MetricId, readingId: number) => {
    setLoading(true);
    try {
      const data = await healthMetricsService.getReading(metricId, readingId);
      setCurrentReading(data);
      return data;
    } catch (error) {
      showNotification('Error fetching reading details', 'error');
      console.error('Error fetching reading details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  /**
   * Create a new reading
   */
  const createReading = useCallback(async (metricId: MetricId, data: MetricFormData) => {
    setLoading(true);
    try {
      const result = await healthMetricsService.createReading(metricId, data);
      showNotification('Reading added successfully', 'success');
      
      // Update current metric if we're viewing it
      if (currentMetric && currentMetric.id === metricId) {
        setCurrentMetric({
          ...currentMetric,
          readings: [result, ...currentMetric.readings]
        });
      }
      
      return result;
    } catch (error) {
      showNotification('Error adding reading', 'error');
      console.error('Error adding reading:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification, currentMetric]);

  /**
   * Update an existing reading
   */
  const updateReading = useCallback(async (metricId: MetricId, readingId: number, data: MetricFormData) => {
    setLoading(true);
    try {
      const result = await healthMetricsService.updateReading(metricId, readingId, data);
      showNotification('Reading updated successfully', 'success');
      
      // Update current metric if we're viewing it
      if (currentMetric && currentMetric.id === metricId) {
        setCurrentMetric({
          ...currentMetric,
          readings: currentMetric.readings.map(reading => 
            reading.id === readingId ? result : reading
          )
        });
      }
      
      return result;
    } catch (error) {
      showNotification('Error updating reading', 'error');
      console.error('Error updating reading:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification, currentMetric]);

  /**
   * Delete a reading
   */
  const deleteReading = useCallback(async (metricId: MetricId, readingId: number) => {
    setLoading(true);
    try {
      await healthMetricsService.deleteReading(metricId, readingId);
      showNotification('Reading deleted successfully', 'success');
      
      // Update current metric if we're viewing it
      if (currentMetric && currentMetric.id === metricId) {
        setCurrentMetric({
          ...currentMetric,
          readings: currentMetric.readings.filter(reading => reading.id !== readingId)
        });
      }
      
      return true;
    } catch (error) {
      showNotification('Error deleting reading', 'error');
      console.error('Error deleting reading:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotification, currentMetric]);

  return {
    loading,
    metrics,
    currentMetric,
    currentReading,
    fetchMetrics,
    fetchMetricDetail,
    fetchReading,
    createReading,
    updateReading,
    deleteReading
  };
};

export default useHealthMetrics; 