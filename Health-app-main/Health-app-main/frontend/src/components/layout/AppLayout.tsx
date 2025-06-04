import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Favorite as FavoriteIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Videocam as VideocamIcon,
  Assessment as AssessmentIcon,
  MenuBook as MenuBookIcon,
  SupervisorAccount as AdminIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Watch as WatchIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';
import Sidebar from '../Sidebar';

const drawerWidth = 260;

const AppLayout = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // User menu
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  
  // Notifications menu
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const notificationOpen = Boolean(notificationAnchorEl);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleLogout = () => {
    signOut();
    navigate('/login');
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  // Navigation items depending on role
  const getNavItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
        roles: ['ADMIN', 'DOCTOR', 'PATIENT']
      },
      {
        text: 'Appointments',
        icon: <CalendarIcon />,
        path:
          user?.user_metadata?.role === 'PATIENT'
            ? '/appointments/new'
            : user?.user_metadata?.role === 'DOCTOR'
            ? '/appointments/doctor'
            : '/appointments',
        roles: ['ADMIN', 'DOCTOR', 'PATIENT']
      }
    ];
    
    // Health Metrics - Only for patients
    if (user?.user_metadata?.role === 'PATIENT') {
      items.push({
        text: 'Health Metrics',
        icon: <FavoriteIcon />,
        path: '/health-metrics',
        roles: ['PATIENT']
      });
      // Medication Tracking - Only for patients
      items.push({
        text: 'Medication Tracking',
        icon: <FavoriteIcon />, // You can use a pill icon if you have one
        path: '/health-metrics/medication-tracking',
        roles: ['PATIENT']
      });
      // Wearable Data - Only for patients
      items.push({
        text: 'Wearable Data',
        icon: <WatchIcon />,
        path: '/wearable-data',
        roles: ['PATIENT']
      });
    }
    
    // Common items for all roles
    items.push(
      {
        text: 'Messages',
        icon: <MessageIcon />,
        path: '/messages',
        roles: ['ADMIN', 'DOCTOR', 'PATIENT']
      },
      {
        text: 'Profile',
        icon: <PersonIcon />,
        path: '/profile',
        roles: ['ADMIN', 'DOCTOR', 'PATIENT']
      }
    );
    
    // Telemedicine - Only for doctors and patients
    if (['DOCTOR', 'PATIENT'].some(role => user?.user_metadata?.role === role)) {
      items.push({
        text: 'Telemedicine',
        icon: <VideocamIcon />,
        path: '/telemedicine',
        roles: ['DOCTOR', 'PATIENT']
      });
    }
    
    // Resources - For all users
    items.push({
      text: 'Knowledge Base',
      icon: <MenuBookIcon />,
      path: '/knowledge-base',
      roles: ['ADMIN', 'DOCTOR', 'PATIENT']
    });
    
    // Admin section - Only for admins
    if (user?.user_metadata?.role === 'ADMIN') {
      items.push({
        text: 'User Management',
        icon: <AdminIcon />,
        path: '/admin/users',
        roles: ['ADMIN']
      });
      
      items.push({
        text: 'Role Management',
        icon: <AdminIcon />,
        path: '/admin/roles',
        roles: ['ADMIN']
      });
    }
    
    return items;
  };
  
  const drawer = (
    <div>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{ minHeight: 48, width: '100%' }}
              onClick={() => handleNavigate(item.path)}
              selected={
                window.location.pathname === item.path ||
                (
                  item.path !== '/health-metrics' &&
                  window.location.pathname.startsWith(item.path)
                ) ||
                (
                  item.path === '/health-metrics' &&
                  window.location.pathname === '/health-metrics'
                )
              }
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: 72,
          justifyContent: 'center',
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              margin: 'auto',
              textAlign: 'center',
              width: 'fit-content',
              pointerEvents: 'none',
              fontWeight: 'bold',
              color: '#fff',
              backgroundColor: 'primary.main',
              boxShadow: 2,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '2rem',
              letterSpacing: 1,
            }}
          >
            Hospital Management System
          </Typography>
          <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          {/* Notifications */}
          <IconButton
            size="large"
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={user?.user_metadata?.role === 'DOCTOR' ? 2 : user?.user_metadata?.role === 'PATIENT' ? 3 : 4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          {/* User profile */}
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar
              alt={user?.user_metadata?.firstName || 'User'}
              src={user?.user_metadata?.profileImage || ''}
              sx={{ width: 32, height: 32 }}
            >
              {user?.user_metadata?.firstName?.[0] || 'U'}
            </Avatar>
          </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Sidebar 
          open={isMobile ? mobileOpen : true} 
          onClose={handleDrawerToggle} 
          variant={isMobile ? "temporary" : "permanent"} 
        />
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Toolbar sx={{ minHeight: 72 }} /> {/* This creates space for the fixed AppBar */}
        <Outlet />
      </Box>
      
      {/* User menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => {
          handleProfileMenuClose();
          navigate('/profile');
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => {
          handleProfileMenuClose();
          navigate('/profile/settings');
        }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleProfileMenuClose();
          handleLogout();
        }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={notificationOpen}
        onClose={handleNotificationMenuClose}
      >
        {user?.user_metadata?.role === 'PATIENT' ? (
          <>
            <MenuItem onClick={handleNotificationMenuClose}>
              <Typography variant="body2">
                Dr. Mantas confirmed your appointment
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationMenuClose}>
              <Typography variant="body2">
                New report is available
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationMenuClose}>
              <Typography variant="body2">
                You have a new message
              </Typography>
            </MenuItem>
          </>
        ) : user?.user_metadata?.role === 'DOCTOR' ? (
          <>
            <MenuItem onClick={handleNotificationMenuClose}>
              <Typography variant="body2">
                New report is available
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationMenuClose}>
              <Typography variant="body2">
                You have a new message
              </Typography>
            </MenuItem>
          </>
        ) : null}
        <Divider />
        <MenuItem 
          onClick={() => {
            handleNotificationMenuClose();
            // Navigate to notifications page if you have one
          }}
          sx={{ justifyContent: 'center' }}
        >
          <Typography variant="body2" color="primary">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppLayout; 