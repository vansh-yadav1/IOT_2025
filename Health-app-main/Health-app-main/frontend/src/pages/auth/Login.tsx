import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import LoginComponent, { LoginFormData } from '../../components/auth/Login';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

// Type guard for API error responses
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function isApiErrorResponse(err: unknown): err is ApiErrorResponse {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('response' in err || 'message' in err)
  );
}

const Login: React.FC = () => {
  const { signIn, loading, user, clearError } = useAuth();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // If the user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (formData: LoginFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError(null);
      clearError();
      
      await signIn(formData.email, formData.password);
      showNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (isApiErrorResponse(err)) {
        errorMessage = err.message || err.response?.data?.message || 'Login failed. Please check your credentials.';
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="auth-page">
      <Paper elevation={3} className="auth-paper">
        <Typography variant="h4" className="auth-page-title">
          Hospital Management System
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <LoginComponent onSubmit={handleLogin} isSubmitting={isSubmitting} />
        )}
      </Paper>
    </Box>
  );
};

export default Login; 