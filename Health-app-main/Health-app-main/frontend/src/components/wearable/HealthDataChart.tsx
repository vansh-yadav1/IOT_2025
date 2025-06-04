import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme,
  CardHeader
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';

interface DataPoint {
  timestamp: string;
  value: number;
  [key: string]: any;
}

interface HealthDataChartProps {
  title: string;
  data: DataPoint[];
  dataKey?: string;
  color?: string;
  unit?: string;
  yAxisLabel?: string;
  formatValue?: (value: number) => string | number;
  formatTimestamp?: (timestamp: string) => string;
  height?: number;
}

const HealthDataChart: React.FC<HealthDataChartProps> = ({
  title,
  data,
  dataKey = 'value',
  color,
  unit = '',
  yAxisLabel = '',
  formatValue = (value: number) => value,
  formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },
  height = 300,
}) => {
  const theme = useTheme();
  const chartColor = color || theme.palette.primary.main;
  
  // Format data to ensure proper timestamps
  const formattedData = data.map(point => ({
    ...point,
    formattedTimestamp: formatTimestamp(point.timestamp)
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: `1px solid ${theme.palette.divider}`,
            p: 2,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            {dataPoint.formattedTimestamp}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 'bold',
              color: chartColor
            }}
          >
            {formatValue(dataPoint[dataKey])} {unit}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', boxShadow: 3 }}>
      <CardHeader 
        title={title}
        sx={{ 
          pb: 0,
          '& .MuiCardHeader-title': {
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }
        }}
      />
      <CardContent sx={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{
              top: 15,
              right: 20,
              left: 20,
              bottom: 15,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="formattedTimestamp" 
              tick={{ fontSize: 12 }} 
              tickFormatter={() => ''}
              stroke={theme.palette.text.secondary}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              stroke={theme.palette.text.secondary}
              tickFormatter={(value: number) => formatValue(value) as string}
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: theme.palette.text.secondary, fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColor, stroke: chartColor }}
              activeDot={{ r: 5, stroke: theme.palette.background.paper, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HealthDataChart; 