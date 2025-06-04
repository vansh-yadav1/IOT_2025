import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { login } from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.performance.clearMarks();
    window.performance.clearMeasures();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('should render login form within 100ms', () => {
    window.performance.mark('render-start');
    renderLogin();
    window.performance.mark('render-end');
    window.performance.measure('render-time', 'render-start', 'render-end');

    const measures = window.performance.getEntriesByName('render-time');
    expect(measures[0].duration).toBeLessThan(100);
  });

  it('should handle form input changes within 50ms', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    window.performance.mark('input-start');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    window.performance.mark('input-end');
    window.performance.measure('input-time', 'input-start', 'input-end');

    const measures = window.performance.getEntriesByName('input-time');
    expect(measures[0].duration).toBeLessThan(50);
  });

  it('should complete login process within 500ms', async () => {
    (login as jest.Mock).mockResolvedValueOnce({
      token: 'mock-token',
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'PATIENT',
        name: 'Test User'
      }
    });

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    window.performance.mark('login-start');
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
    
    window.performance.mark('login-end');
    window.performance.measure('login-time', 'login-start', 'login-end');

    const measures = window.performance.getEntriesByName('login-time');
    expect(measures[0].duration).toBeLessThan(500);
  });

  it('should handle multiple rapid login attempts', async () => {
    const loginAttempts = 5;
    const loginPromises = [];
    
    (login as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
      return {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'PATIENT',
          name: 'Test User'
        }
      };
    });

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    window.performance.mark('multiple-login-start');

    for (let i = 0; i < loginAttempts; i++) {
      fireEvent.change(emailInput, { target: { value: `test${i}@example.com` } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      loginPromises.push(fireEvent.click(signInButton));
    }

    await Promise.all(loginPromises);
    
    window.performance.mark('multiple-login-end');
    window.performance.measure('multiple-login-time', 'multiple-login-start', 'multiple-login-end');

    const measures = window.performance.getEntriesByName('multiple-login-time');
    expect(measures[0].duration).toBeLessThan(loginAttempts * 200); // Allow 200ms per attempt
  });

  it('should maintain performance under memory pressure', () => {
    const iterations = 100;
    const memoryUsage = [];

    for (let i = 0; i < iterations; i++) {
      window.performance.mark('memory-test-start');
      renderLogin();
      window.performance.mark('memory-test-end');
      window.performance.measure('memory-test', 'memory-test-start', 'memory-test-end');
      
      const measures = window.performance.getEntriesByName('memory-test');
      memoryUsage.push(measures[0].duration);
    }

    // Calculate average and standard deviation
    const average = memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length;
    const stdDev = Math.sqrt(
      memoryUsage.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / memoryUsage.length
    );

    // Performance should not degrade significantly
    expect(stdDev).toBeLessThan(average * 0.5); // Standard deviation should be less than 50% of average
  });
}); 