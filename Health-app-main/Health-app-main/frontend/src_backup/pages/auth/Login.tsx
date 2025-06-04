import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
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
}

function isApiErrorResponse(err: unknown): err is ApiErrorResponse {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof err.response === 'object' &&
    err.response !== null
  );
}

const Login: React.FC = () => {
  const { signIn, loading, user, error, clearError } = useAuth();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      showNotification(error.message, 'error');
      clearError();
    }
  }, [error, showNotification, clearError]);

  // If the user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (formData: LoginFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      clearError();
      await signIn(formData.email, formData.password);
      showNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
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