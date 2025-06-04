import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
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
import { MetricId } from '../../types/health-metrics';

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

interface MetricsVisualizationProps {
  metricId: MetricId;
  title?: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
  }>;
  height?: number | string;
  showLegend?: boolean;
  beginAtZero?: boolean;
}

const MetricsVisualization: React.FC<MetricsVisualizationProps> = ({
  metricId,
  title,
  labels,
  datasets,
  height = 300,
  showLegend = false,
  beginAtZero = false
}) => {
  const theme = useTheme();

  // Define colors based on metric type
  const getMetricColors = (id: MetricId) => {
    switch (id) {
      case 'heart-rate':
        return {
          border: '#e91e63',
          background: 'rgba(233, 30, 99, 0.1)'
        };
      case 'blood-pressure':
        return {
          border: '#1e88e5',
          background: 'rgba(30, 136, 229, 0.1)'
        };
      case 'oxygen-level':
        return {
          border: '#43a047',
          background: 'rgba(67, 160, 71, 0.1)'
        };
      case 'body-temperature':
        return {
          border: '#ff9800',
          background: 'rgba(255, 152, 0, 0.1)'
        };
      default:
        return {
          border: theme.palette.primary.main,
          background: `${theme.palette.primary.main}20`
        };
    }
  };

  const colors = getMetricColors(metricId);

  // Apply default styling to datasets
  const enhancedDatasets = datasets.map(dataset => ({
    ...dataset,
    borderColor: dataset.borderColor || colors.border,
    backgroundColor: dataset.backgroundColor || colors.background,
    borderWidth: 2,
    pointRadius: 3,
    fill: dataset.fill !== undefined ? dataset.fill : true,
    tension: dataset.tension !== undefined ? dataset.tension : 0.3
  }));

  const data = {
    labels,
    datasets: enhancedDatasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      },
      title: {
        display: !!title,
        text: title || ''
      }
    },
    scales: {
      y: {
        beginAtZero,
        grid: {
          drawBorder: false,
          color: theme.palette.divider
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4
      }
    }
  };

  return (
    <Box sx={{ height, position: 'relative' }}>
      {!labels.length ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1
        }}>
          <Typography variant="body2" color="text.secondary">
            No data available for visualization
          </Typography>
        </Box>
      ) : (
        <Line data={data} options={options} />
      )}
    </Box>
  );
};

export default MetricsVisualization; 