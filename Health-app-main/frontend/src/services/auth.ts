import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
    name: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    
    const { token, user } = response.data;
    
    // Store the token in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set the default Authorization header for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Invalid credentials');
    }
    throw new Error('An error occurred during login');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
}; 