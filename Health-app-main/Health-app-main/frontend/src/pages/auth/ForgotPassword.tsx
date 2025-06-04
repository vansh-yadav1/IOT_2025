import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

const ForgotPassword = () => {
  const { forgotPassword, error, clearError } = useAuth();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      showNotification('Please enter your email address', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      await forgotPassword(email);
      setSubmitted(true);
      showNotification('Password reset email sent. Please check your inbox.', 'success');
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      showNotification(
        err instanceof Error 
          ? err.message 
          : typeof err === 'object' && err !== null && 'response' in err 
            ? (err as any).response?.data?.message || 'Failed to send password reset email. Please try again.'
            : 'Failed to send password reset email. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="auth-page">
      <Paper elevation={3} className="auth-paper">
        <Typography variant="h4" className="auth-page-title">
          Forgot Password
        </Typography>
        
        {submitted ? (
          <Box textAlign="center">
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset instructions have been sent to your email.
            </Alert>
            <Typography variant="body1" paragraph>
              Please check your email and follow the instructions to reset your password.
            </Typography>
            <Typography variant="body2">
              <Link to="/login">Return to login</Link>
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Typography variant="body1" paragraph>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
            
            <Box mt={2} textAlign="center">
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

export default ForgotPassword; 