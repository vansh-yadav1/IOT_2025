import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Tooltip } from '@mui/material';

interface HealthDataCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  progress?: number; // Value between 0 and 1
  tooltip?: string;
}

const HealthDataCard: React.FC<HealthDataCardProps> = ({
  title,
  value,
  unit,
  icon,
  color = '#4338ca',
  progress,
  tooltip,
}) => {
  const cardContent = (
    <Card 
      sx={{ 
        minWidth: 200, 
        height: '100%',
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color }}>
              {icon}
            </Box>
          )}
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}{unit && <Typography variant="body2" component="span" sx={{ ml: 1 }}>{unit}</Typography>}
        </Typography>
        
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress * 100} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 4,
                }
              }} 
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
  
  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        <div>{cardContent}</div>
      </Tooltip>
    );
  }
  
  return cardContent;
};

export default HealthDataCard; 