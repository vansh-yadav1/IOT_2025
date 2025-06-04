import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
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

const mockedLogin = login as jest.MockedFunction<typeof login>;

describe('Login Component', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    renderLogin();
  });

  it('renders login form', () => {
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    // Simulate blur to mark fields as touched
    fireEvent.blur(emailInput);
    fireEvent.blur(passwordInput);
    
    await act(async () => {
      fireEvent.click(signInButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    // Mock login to resolve after a delay
    mockedLogin.mockImplementationOnce(() => new Promise(res => setTimeout(() => res({ token: 'fake-token' }), 100)));

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);
    });

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });

    // Wait for login to complete
    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('handles login error', async () => {
    mockedLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(signInButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
}); 