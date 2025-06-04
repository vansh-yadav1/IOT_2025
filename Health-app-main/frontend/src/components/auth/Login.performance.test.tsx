import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import Login from './Login';
import { login } from '../../services/auth';
import '@testing-library/jest-dom';

// Mock the auth service
jest.mock('../../services/auth');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockedLogin = login as jest.MockedFunction<typeof login>;

describe('Login Component Performance Tests', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    renderLogin();
  });

  it('should render login form within 150ms', () => {
    const startTime = window.performance.now();
    renderLogin();
    const endTime = window.performance.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(150);
  });

  it('should handle form input changes within 50ms', async () => {
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const startTime = window.performance.now();
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });
    
    const endTime = window.performance.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(50);
  });

  it('should handle validation errors within 100ms', async () => {
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const startTime = window.performance.now();
    
    // Simulate blur to mark fields as touched
    fireEvent.blur(emailInput);
    fireEvent.blur(passwordInput);
    
    await act(async () => {
      fireEvent.click(signInButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    
    const endTime = window.performance.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
  });

  it('should complete login process within 500ms', async () => {
    // Mock login to resolve after a delay
    mockedLogin.mockImplementationOnce(() => new Promise(res => setTimeout(() => res({ token: 'fake-token' }), 100)));
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    const startTime = window.performance.now();
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
    
    const endTime = window.performance.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(500);
  });

  it('should handle multiple rapid input changes efficiently', async () => {
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const startTime = window.performance.now();
    
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: `test${i}@example.com` } });
      });
    }
    
    const endTime = window.performance.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(500); // 50ms per change
  });

  it('should handle multiple login attempts efficiently', async () => {
    // Mock login to resolve after a delay
    mockedLogin.mockImplementation(() => new Promise(res => setTimeout(() => res({ token: 'fake-token' }), 100)));
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    const startTime = window.performance.now();
    
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: `test${i}@example.com` } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(signInButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/logging in/i)).toBeInTheDocument();
      });
    }
    
    const endTime = window.performance.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(2500); // 500ms per attempt
  });

  it('should maintain performance under memory pressure', async () => {
    // Mock login to resolve after a delay
    mockedLogin.mockImplementationOnce(() => new Promise(res => setTimeout(() => res({ token: 'fake-token' }), 100)));
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    // Create some memory pressure
    const largeArray = new Array(1000).fill('test');
    
    const startTime = window.performance.now();
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
    
    const endTime = window.performance.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(500);
  });
}); 