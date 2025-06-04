import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material';
import { 
  DashboardOutlined, 
  CalendarMonthOutlined, 
  FavoriteBorderOutlined, 
  MessageOutlined,
  PermIdentityOutlined,
  DescriptionOutlined,
  MenuBookOutlined,
  VideocamOutlined,
  WatchOutlined,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "persistent" | "temporary";
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const menuItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      icon: <DashboardOutlined />,
      path: user?.user_metadata?.role === 'DOCTOR' ? '/dashboard/doctor' : user?.user_metadata?.role === 'PATIENT' ? '/dashboard/patient' : '/dashboard',
    },
    {
      title: 'Patients',
      icon: <PermIdentityOutlined />,
      path: user?.user_metadata?.role === 'DOCTOR' ? '/patients/doctor' : user?.user_metadata?.role === 'PATIENT' ? '/patients/patient' : '/patients',
      roles: ['DOCTOR', 'PATIENT'],
    },
    {
      title: 'Appointments',
      icon: <CalendarMonthOutlined />,
      path: user?.user_metadata?.role === 'DOCTOR' ? '/appointments/doctor' : user?.user_metadata?.role === 'PATIENT' ? '/appointments/new/patient' : '/appointments/new',
    },
    {
      title: 'Messages',
      icon: <MessageOutlined />,
      path: user?.user_metadata?.role === 'DOCTOR' ? '/messages/doctor' : user?.user_metadata?.role === 'PATIENT' ? '/messages/patient' : '/messages',
    },
    {
      title: 'Reports',
      icon: <DescriptionOutlined />,
      path: user?.user_metadata?.role === 'PATIENT' ? '/reports/patient' : '/reports',
      roles: ['PATIENT'],
    },
    {
      title: 'Telemedicine',
      icon: <VideocamOutlined />,
      path: user?.user_metadata?.role === 'DOCTOR' ? '/telemedicine/doctor' : user?.user_metadata?.role === 'PATIENT' ? '/telemedicine/patient' : '/telemedicine',
    },
    {
      title: 'Resources',
      icon: <MenuBookOutlined />,
      path: user?.user_metadata?.role === 'DOCTOR' ? '/resources/doctor' : user?.user_metadata?.role === 'PATIENT' ? '/resources/patient' : '/resources',
    },
    {
      title: 'Profile',
      icon: <PermIdentityOutlined />,
      path: user?.user_metadata?.role === 'DOCTOR' ? '/profile/doctor' : user?.user_metadata?.role === 'PATIENT' ? '/profile/patient' : '/profile',
    },
    {
      title: 'Health Metrics',
      icon: <FavoriteBorderOutlined />,
      path: user?.user_metadata?.role === 'PATIENT' ? '/health-metrics/patient' : '/health-metrics',
      roles: ['PATIENT'],
    },
    {
      title: 'Wearable Data',
      icon: <WatchOutlined />,
      path: user?.user_metadata?.role === 'PATIENT' ? '/wearable-data/patient' : '/wearable-data',
      roles: ['PATIENT'],
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === "temporary") {
      onClose();
    }
  };
  
  // Reorder menu items for patient login
  let orderedMenuItems: SidebarItem[] = menuItems;
  if (user?.user_metadata?.role === 'PATIENT') {
    const patientOrder = [
      menuItems.find(item => item.title === 'Dashboard'),
      menuItems.find(item => item.title === 'Health Metrics'),
      menuItems.find(item => item.title === 'Appointments'),
      menuItems.find(item => item.title === 'Messages'),
      menuItems.find(item => item.title === 'Telemedicine'),
      menuItems.find(item => item.title === 'Reports'),
      menuItems.find(item => item.title === 'Wearable Data'),
      menuItems.find(item => item.title === 'Resources'),
      menuItems.find(item => item.title === 'Profile'),
    ];
    orderedMenuItems = patientOrder.filter((item): item is SidebarItem => !!item);
  }

  // Filter menu items by role
  const userRole = user?.user_metadata?.role;
  const filteredMenuItems = orderedMenuItems.filter(item => {
    if (item.roles && (!userRole || !item.roles.includes(userRole))) {
      return false;
    }
    return true;
  });

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
        },
      }}
    >
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{
          mb: 3,
          fontWeight: 'bold',
          fontSize: '2.2rem',
          textAlign: 'center',
          color: 'primary.main',
          letterSpacing: 1,
          lineHeight: 1.1,
        }}>
          {user?.user_metadata?.role === 'DOCTOR' ? 'Doctor Desk' : 'Health Desk'}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 1,
                  my: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 