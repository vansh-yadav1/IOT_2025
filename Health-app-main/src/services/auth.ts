import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>('/api/auth/login', { email, password });
  const { token, user } = response.data;
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
}; 