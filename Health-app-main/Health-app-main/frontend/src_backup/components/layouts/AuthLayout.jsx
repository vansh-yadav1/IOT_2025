import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>Hospital Management System</h1>
        </div>
        <div className="auth-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 