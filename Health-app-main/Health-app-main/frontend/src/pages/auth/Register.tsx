import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import RegisterComponent, { RegisterFormData } from '../../components/auth/Register';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';
import { UserMetadata, Role } from '../../types/user';
import axios from 'axios';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for API data and errors
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
  const { signUp, loading, user, clearError } = useAuth();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // If the user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (formData: RegisterFormData): Promise<void> => {
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      showNotification('Passwords do not match', 'error');
      return;
    }

    // If doctor, ensure location is entered
    if (formData.role === 'DOCTOR' && !formData.location) {
      setError('Please enter your location.');
      showNotification('Please enter your location.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      clearError();

      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // Create user data object for Supabase
      const metadata: UserMetadata = {
        full_name: fullName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as Role,
        // Add additional fields based on role
        ...(formData.role === 'DOCTOR' ? {
          specialization: formData.specialization || 'General Medicine',
          licenseNumber: ''
        } : {})
      };

      console.log('Registering with metadata:', metadata); // Debug log

      // Sign up the user
      const cleanEmail = formData.email.toLowerCase().trim();
      console.log('Registering with email:', cleanEmail);
      const result = await signUp(
        cleanEmail,
        formData.password,
        metadata
      );

      let userId = result?.user?.id;

      // If userId is not available, try to get it from the current session
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id;
      }

      // If doctor, register in doctors table
      if (formData.role === 'DOCTOR' && userId) {
        try {
          // Call backend to register doctor
          await axios.post('http://localhost:8000/doctors/register', {
            id: userId,
            name: fullName,
            specialty: formData.specialization || 'General Medicine',
            location: formData.location
          });

          // Also create a doctor_profile in Supabase for frontend use
          const licenseNumber = 'MD' + Math.floor(10000 + Math.random() * 90000);
          const { error: profileError } = await supabase
            .from('doctor_profiles')
            .insert({
              id: uuidv4(),
              user_id: userId,
              license_number: licenseNumber,
              experience_years: 0, // Default value
              bio: `Dr. ${fullName} is a ${formData.specialization || 'General Medicine'} specialist.`,
              languages: ['English'],
              availability_status: 'AVAILABLE',
              rating: 0,
              rating_count: 0,
              consultation_fee: 100.00 // Default value
            });

          if (profileError) {
            console.error('Error creating doctor profile:', profileError);
            throw new Error('Failed to create doctor profile');
          }
        } catch (err) {
          setError('Doctor registration failed. Please try again.');
          showNotification('Doctor registration failed. Please try again.', 'error');
          setIsSubmitting(false);
          return;
        }
      }

      if (result?.requiresEmailConfirmation) {
        showNotification(
          'Registration successful! Please check your email to confirm your account.',
          'success'
        );
      } else {
        showNotification('Registration successful!', 'success');
      }
      
      navigate('/login');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (isApiErrorResponse(err)) {
        errorMessage = err.message || err.response?.data?.message || 'Registration failed. Please try again.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
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
          <RegisterComponent onSubmit={handleRegister} isSubmitting={isSubmitting} />
        )}
      </Paper>
    </Box>
  );
};

export default Register; 