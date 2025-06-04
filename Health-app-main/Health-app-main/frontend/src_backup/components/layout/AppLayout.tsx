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
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const drawerWidth = 240;

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
        path: '/appointments',
        roles: ['ADMIN', 'DOCTOR', 'PATIENT']
      }
    ];
    
    // Health Metrics - Only for patients
    if (user?.user_metadata?.roles?.includes('PATIENT')) {
      items.push({
        text: 'Health Metrics',
        icon: <FavoriteIcon />,
        path: '/health-metrics',
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
    if (['DOCTOR', 'PATIENT'].some(role => user?.user_metadata?.roles?.includes(role))) {
      items.push({
        text: 'Telemedicine',
        icon: <VideocamIcon />,
        path: '/telemedicine',
        roles: ['DOCTOR', 'PATIENT']
      });
    }
    
    // Reports - Only for doctors and patients
    if (['DOCTOR', 'PATIENT'].some(role => user?.user_metadata?.roles?.includes(role))) {
      items.push({
        text: 'Reports',
        icon: <AssessmentIcon />,
        path: '/reports',
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
    if (user?.user_metadata?.roles?.includes('ADMIN')) {
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
      <Toolbar className="drawer-header">
        <Typography variant="h6" noWrap component="div">
          Hospital System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={window.location.pathname === item.path || window.location.pathname.startsWith(`${item.path}/`)}
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
        }}
      >
        <Toolbar>
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
            sx={{ flexGrow: 1 }}
          >
            {/* Page title could be dynamic based on current route */}
            Hospital Management System
          </Typography>
          
          {/* Notifications */}
          <IconButton
            size="large"
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={4} color="error">
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
              sx={{ width: 32, height: 32 }}
            >
              {user?.user_metadata?.firstName?.[0] || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
          open
        >
          {drawer}
        </Drawer>
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
        <Toolbar /> {/* This creates space for the fixed AppBar */}
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
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2">
            Dr. Smith confirmed your appointment
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