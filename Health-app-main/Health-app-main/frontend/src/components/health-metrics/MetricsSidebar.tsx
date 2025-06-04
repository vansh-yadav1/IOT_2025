import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Favorite as HeartIcon,
  Bloodtype as BloodIcon,
  AirOutlined as OxygenIcon,
  Thermostat as TemperatureIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';

const MetricsSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Define metrics menu items
  const primaryMenuItems = [
    {
      name: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/health-metrics'
    },
    {
      name: 'Heart Rate',
      icon: <HeartIcon style={{ color: '#e91e63' }} />,
      path: '/health-metrics/heart-rate'
    },
    {
      name: 'Blood Pressure',
      icon: <BloodIcon style={{ color: '#1e88e5' }} />,
      path: '/health-metrics/blood-pressure'
    },
    {
      name: 'Oxygen Level',
      icon: <OxygenIcon style={{ color: '#43a047' }} />,
      path: '/health-metrics/oxygen-level'
    },
    {
      name: 'Body Temperature',
      icon: <TemperatureIcon style={{ color: '#ff9800' }} />,
      path: '/health-metrics/body-temperature'
    },
    {
      name: 'Medication Tracking',
      icon: <MedicationIcon style={{ color: '#8e24aa' }} />,
      path: '/health-metrics/medications'
    }
  ];

  const secondaryMenuItems = [
    {
      name: 'History',
      icon: <HistoryIcon />,
      path: '/health-metrics/history'
    },
    {
      name: 'Settings',
      icon: <SettingsIcon />,
      path: '/health-metrics/settings'
    }
  ];

  return (
    <Paper elevation={0} sx={{ 
      height: '100%', 
      borderRadius: 0,
      borderRight: '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="medium">
          Health Metrics
        </Typography>
      </Box>
      
      <Divider />
      
      <List component="nav" sx={{ px: 1 }}>
        {primaryMenuItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 48,
                borderRadius: 1,
                mb: 0.5,
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      <List component="nav" sx={{ px: 1 }}>
        {secondaryMenuItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 48,
                borderRadius: 1,
                mb: 0.5,
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default MetricsSidebar; 