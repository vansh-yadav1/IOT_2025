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
  SentimentDissatisfied as SadIcon
} from '@mui/icons-material';
import './Public.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box className="error-page">
      <Container maxWidth="md">
        <Paper elevation={3} className="error-container">
          <SadIcon sx={{ fontSize: 64, color: '#3498db', mb: 2 }} />
          <Typography variant="h1" className="error-code">
            404
          </Typography>
          <Typography variant="h4" className="error-title">
            Page Not Found
          </Typography>
          <Typography variant="body1" className="error-message">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </Typography>
          <Box className="error-actions">
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/')}
            >
              Go to Homepage
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound; 