import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has the required role
  if (roles && roles.length > 0) {
    // Try to get role from user_metadata, fallback to raw_user_meta_data, user_metadata.roles (array), or user.role
    let userRole = '';
    if (user.user_metadata?.role) {
      userRole = user.user_metadata.role;
    } else if ((user as any)['raw_user_meta_data']?.role) {
      userRole = (user as any)['raw_user_meta_data'].role;
    } else if (user.role) {
      userRole = user.role;
    }
    userRole = userRole.toUpperCase();
    const requiredRoles = roles.map(r => r.toUpperCase());
    // Debug log
    console.log('PrivateRoute: user role =', userRole, 'required roles =', requiredRoles, 'user:', user);
    if (!userRole) {
      // If role is missing, show a clear error or redirect
      return <div style={{ color: 'red', padding: 32 }}>
        <h2>Access Denied: No role found</h2>
        <div>Your user account is missing a role. Please contact admin.</div>
        <div><b>Debug info:</b></div>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>;
    }
    const hasRequiredRole = requiredRoles.includes(userRole);
    if (!hasRequiredRole) {
      return <div style={{ color: 'red', padding: 32 }}>
        <h2>Access Denied: Role mismatch</h2>
        <div>Your role: <b>{userRole}</b></div>
        <div>Required roles: <b>{requiredRoles.join(', ')}</b></div>
        <div><b>Debug info:</b></div>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>;
    }
  }

  // User is authenticated and has required roles, render the protected route
  return <>{children}</>;
};

export default PrivateRoute; 