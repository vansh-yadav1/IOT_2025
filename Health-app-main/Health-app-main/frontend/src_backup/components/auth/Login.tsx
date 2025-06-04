import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

// Define props interface for the component
export interface LoginFormData {
  email: string;
  password: string;
}

interface LoginProps {
  onSubmit: (formData: LoginFormData) => Promise<void>;
  isSubmitting: boolean;
}

const Login: React.FC<LoginProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Login to your account</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        <button 
          type="submit" 
          className="auth-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="auth-links">
        <p>
          <Link to="/register" className="auth-link">Don't have an account? Register here</Link>
        </p>
        <p>
          <Link to="/forgot-password" className="auth-link">Forgot your password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 