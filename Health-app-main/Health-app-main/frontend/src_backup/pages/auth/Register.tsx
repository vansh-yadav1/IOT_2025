import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import RegisterComponent, { RegisterFormData } from '../../components/auth/Register';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

// Define interfaces for API data and errors
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
}

// Type guard for API error responses
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
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

const Register: React.FC = () => {
  const { signUp, loading, user, error, clearError } = useAuth();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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

  const handleRegister = async (formData: RegisterFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      clearError();

      const fullName = `${formData.firstName} ${formData.lastName}`;
      const metadata = {
        full_name: fullName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        roles: [formData.role],
        specialization: formData.role === 'DOCTOR' ? formData.specialization : undefined,
        licenseNumber: formData.role === 'DOCTOR' ? formData.licenseNumber : undefined
      };

      await signUp(
        formData.email,
        formData.password,
        metadata
      );
      
      showNotification('Registration successful! Welcome to Hospital Management System.', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setFormError(errorMessage);
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
        
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <RegisterComponent onSubmit={handleRegister} isSubmitting={isSubmitting} />
        )}
      </Paper>
    </Box>
  );
};

export default Register; 