import { LoginResponse } from '../auth';

export const login = jest.fn().mockImplementation(async (email: string, password: string): Promise<LoginResponse> => {
  if (email === 'test@example.com' && password === 'password123') {
    return {
      token: 'mock-token',
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'PATIENT',
        name: 'Test User'
      }
    };
  }
  throw new Error('Invalid credentials');
});

export const logout = jest.fn();

export const getCurrentUser = jest.fn().mockReturnValue({
  id: '1',
  email: 'test@example.com',
  role: 'PATIENT',
  name: 'Test User'
});

export const isAuthenticated = jest.fn().mockReturnValue(true); 