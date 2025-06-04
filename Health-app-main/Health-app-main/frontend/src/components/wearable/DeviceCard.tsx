import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { WatchOutlined, FitnessCenterOutlined, MonitorHeartOutlined, CheckCircleOutlined } from '@mui/icons-material';
import { WearableDevice } from '../../services/wearableService';

interface DeviceCardProps {
  device: WearableDevice;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  // Helper to get the appropriate icon based on device type
  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('watch') || type.includes('band')) {
      return <WatchOutlined />;
    } else if (type.includes('scale') || type.includes('fitness')) {
      return <FitnessCenterOutlined />;
    } else {
      return <MonitorHeartOutlined />;
    }
  };
  
  // Format the date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get color based on device manufacturer
  const getManufacturerColor = (manufacturer: string) => {
    const brands: {[key: string]: string} = {
      'apple': '#000000',
      'fitbit': '#00B0B9',
      'garmin': '#0078D4',
      'samsung': '#1428A0',
      'withings': '#FF6900',
      'xiaomi': '#FF6700',
      'oura': '#8B6CFF',
      'whoop': '#00C09D',
    };
    
    const mfr = manufacturer.toLowerCase();
    for (const [brand, color] of Object.entries(brands)) {
      if (mfr.includes(brand)) {
        return color;
      }
    }
    
    return '#888888'; // Default color
  };
  
  const deviceIcon = getDeviceIcon(device.type);
  const brandColor = getManufacturerColor(device.manufacturer);
  
  return (
    <Card 
      sx={{ 
        display: 'flex',
        minWidth: 300,
        mb: 2,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: brandColor,
          color: 'white',
          p: 2,
          width: 80
        }}
      >
        {deviceIcon}
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography component="div" variant="h6">
              {device.name}
            </Typography>
            <Chip
              size="small"
              icon={<CheckCircleOutlined />}
              label="Connected"
              color="success"
              variant="outlined"
            />
          </Box>
          
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {device.manufacturer} · {device.type}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Connected Since:</strong> {formatDate(device.connected_since)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Last Sync:</strong> {formatDate(device.last_sync)}
            </Typography>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default DeviceCard; 