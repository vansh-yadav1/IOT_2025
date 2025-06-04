import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  AppBar,
  Toolbar,
  Link,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Favorite as FavoriteIcon,
  Videocam as VideocamIcon,
  LocalHospital as HospitalIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import './Public.css';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      title: 'Appointment Management',
      description: 'Easily schedule, reschedule, or cancel appointments with your healthcare providers.',
      icon: <CalendarIcon fontSize="large" />
    },
    {
      title: 'Health Monitoring',
      description: 'Track your vital signs and health metrics over time with intuitive dashboards.',
      icon: <FavoriteIcon fontSize="large" />
    },
    {
      title: 'Telemedicine',
      description: 'Connect with doctors remotely through secure video consultations.',
      icon: <VideocamIcon fontSize="large" />
    },
    {
      title: 'Medical Records',
      description: 'Access your complete medical history and reports in one secure location.',
      icon: <HospitalIcon fontSize="large" />
    },
    {
      title: 'Fast & Efficient',
      description: 'Optimized workflows for both patients and healthcare providers.',
      icon: <SpeedIcon fontSize="large" />
    },
    {
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security.',
      icon: <SecurityIcon fontSize="large" />
    }
  ];

  return (
    <Box className="landing-page">
      {/* Header/Navbar */}
      <AppBar position="static" className="landing-navbar" elevation={0}>
        <Toolbar>
          <Typography variant="h5" className="landing-logo">
            Hospital Management System
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {!isMobile && (
            <Box className="landing-nav-links">
              <Link component={RouterLink} to="/" color="inherit" underline="none">
                Home
              </Link>
              <Link component={RouterLink} to="/#features" color="inherit" underline="none">
                Features
              </Link>
              <Link component={RouterLink} to="/#about" color="inherit" underline="none">
                About
              </Link>
              <Link component={RouterLink} to="/#contact" color="inherit" underline="none">
                Contact
              </Link>
            </Box>
          )}
          <Box className="landing-auth-buttons">
            <Button component={RouterLink} to="/login" color="inherit" variant="outlined">
              Login
            </Button>
            <Button component={RouterLink} to="/register" color="primary" variant="contained">
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box className="landing-hero">
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" className="landing-hero-title">
                Modern Healthcare Management
              </Typography>
              <Typography variant="h5" className="landing-hero-subtitle">
                Streamlined patient care and hospital administration
              </Typography>
              <Typography variant="body1" paragraph className="landing-hero-description">
                Our comprehensive hospital management system connects patients with healthcare 
                providers through an intuitive digital platform, improving care coordination and 
                patient outcomes.
              </Typography>
              <Box className="landing-hero-buttons">
                <Button 
                  component={RouterLink} 
                  to="/register" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                >
                  Get Started
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/#learn-more" 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="landing-hero-image-container">
                <img 
                  src="/images/hero-image.jpg" 
                  alt="Healthcare professionals" 
                  className="landing-hero-image"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Healthcare+System';
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="landing-features" id="features">
        <Container>
          <Typography variant="h3" align="center" className="landing-section-title">
            Key Features
          </Typography>
          <Typography variant="h6" align="center" className="landing-section-subtitle">
            Everything you need for modern healthcare management
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="landing-feature-card">
                  <CardContent>
                    <Box className="landing-feature-icon">
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" className="landing-feature-title">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" className="landing-feature-description">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box className="landing-about" id="about">
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" className="landing-section-title">
                About Our System
              </Typography>
              <Typography variant="body1" paragraph>
                The Hospital Management System is designed to streamline healthcare delivery and 
                administration, making it easier for patients to access care and for providers to 
                deliver it efficiently.
              </Typography>
              <Typography variant="body1" paragraph>
                Our platform connects all stakeholders in the healthcare ecosystem, from patients 
                and doctors to administrators and support staff, creating a seamless experience for everyone.
              </Typography>
              <Typography variant="body1" paragraph>
                With a focus on security, usability, and efficiency, our system helps healthcare 
                organizations reduce administrative overhead while improving patient satisfaction.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="landing-about-image-container">
                <img 
                  src="/images/about-image.jpg" 
                  alt="Hospital team" 
                  className="landing-about-image"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Hospital+Team';
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className="landing-cta">
        <Container>
          <Box className="landing-cta-content">
            <Typography variant="h3" align="center" className="landing-cta-title">
              Ready to transform your healthcare experience?
            </Typography>
            <Typography variant="h6" align="center" className="landing-cta-subtitle">
              Join thousands of patients and providers who are already using our platform
            </Typography>
            <Box className="landing-cta-buttons">
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                color="primary" 
                size="large"
              >
                Register Now
              </Button>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="outlined" 
                color="primary" 
                size="large"
              >
                Login
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="landing-footer" id="contact">
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="landing-footer-title">
                Hospital Management System
              </Typography>
              <Typography variant="body2" className="landing-footer-description">
                Modern healthcare management solution for patients and providers.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" className="landing-footer-title">
                Quick Links
              </Typography>
              <Box className="landing-footer-links">
                <Link component={RouterLink} to="/" color="inherit">
                  Home
                </Link>
                <Link component={RouterLink} to="/#features" color="inherit">
                  Features
                </Link>
                <Link component={RouterLink} to="/#about" color="inherit">
                  About
                </Link>
                <Link component={RouterLink} to="/login" color="inherit">
                  Login
                </Link>
                <Link component={RouterLink} to="/register" color="inherit">
                  Register
                </Link>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" className="landing-footer-title">
                Contact Us
              </Typography>
              <Typography variant="body2" className="landing-footer-contact">
                Email: info@hospitalsystem.com
              </Typography>
              <Typography variant="body2" className="landing-footer-contact">
                Phone: +1 (123) 456-7890
              </Typography>
              <Typography variant="body2" className="landing-footer-contact">
                Address: 123 Healthcare St, Medical City, MC 12345
              </Typography>
            </Grid>
          </Grid>
          <Box className="landing-footer-bottom">
            <Typography variant="body2" align="center">
              © {new Date().getFullYear()} Hospital Management System. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 