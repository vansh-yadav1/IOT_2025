import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { CheckCircleOutline as CheckCircleIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

// Interface for form data
interface FormData {
  password: string;
  confirmPassword: string;
}

// Interface for validation errors
interface ValidationErrors {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { resetPassword, error, clearError } = useAuth();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation errors when user types
    if (name in validationErrors) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors: ValidationErrors = { password: '', confirmPassword: '' };
    
    // Password validation
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!token) {
      showNotification('Invalid or missing reset token', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      
      await resetPassword(token, formData.password);
      
      setIsComplete(true);
      showNotification('Password has been reset successfully', 'success');
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 
          'data' in err.response && err.response.data && 
          typeof err.response.data === 'object' && 
          'message' in err.response.data && 
          typeof err.response.data.message === 'string') {
        errorMessage = err.response.data.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Box className="auth-page">
        <Paper elevation={3} className="auth-paper">
          <Typography variant="h4" className="auth-page-title">
            Invalid Reset Link
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            The password reset link is invalid or has expired.
          </Alert>
          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              <Link to="/forgot-password">Request a new password reset link</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="auth-page">
      <Paper elevation={3} className="auth-paper">
        <Typography variant="h4" className="auth-page-title">
          Reset Password
        </Typography>
        
        {isComplete ? (
          <Box textAlign="center">
            <CheckCircleIcon className="auth-success-icon" />
            <Typography variant="h6" gutterBottom>
              Password Reset Complete
            </Typography>
            <Typography variant="body1" paragraph>
              Your password has been reset successfully.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/login')}
              fullWidth
            >
              Log In with New Password
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Typography variant="body1" paragraph>
              Enter your new password below.
            </Typography>
            
            <TextField
              label="New Password"
              type="password"
              name="password"
              fullWidth
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              required
              disabled={isSubmitting}
            />
            
            <TextField
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              fullWidth
              variant="outlined"
              margin="normal"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              required
              disabled={isSubmitting}
            />
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {typeof error === 'string' ? error : error.message}
              </Alert>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="auth-form-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Box textAlign="center">
              <Typography variant="body2">
                <Link to="/login">Back to login</Link>
              </Typography>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword; 