import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper 
} from '@mui/material';
import { 
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import './Public.css';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box className="error-page">
      <Container maxWidth="md">
        <Paper elevation={3} className="error-container">
          <LockIcon sx={{ fontSize: 64, color: '#e74c3c', mb: 2 }} />
          <Typography variant="h1" className="error-code">
            403
          </Typography>
          <Typography variant="h4" className="error-title">
            Access Denied
          </Typography>
          <Typography variant="body1" className="error-message">
            You don't have permission to access this page.
            {!user ? ' Please log in to continue.' : ' Please contact the administrator if you believe this is a mistake.'}
          </Typography>
          <Box className="error-actions">
            {user ? (
              <>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  onClick={() => navigate('/')}
                >
                  Go to Homepage
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Unauthorized; 