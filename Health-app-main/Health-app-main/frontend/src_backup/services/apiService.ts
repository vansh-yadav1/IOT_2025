import axios from 'axios';
import { supabase } from '../config/supabase';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL 
    : '', // Empty baseURL uses proxy in development
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic function to handle Supabase queries
export const querySupabase = async <T extends Record<string, unknown>>(
  table: string,
  query: Partial<T>
): Promise<T[]> => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select()
      .match(query);

    if (error) throw error;
    return data as T[];
  } catch (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
};

// Generic function to handle Supabase inserts
export const insertSupabase = async <T extends Record<string, unknown>>(
  table: string,
  data: Omit<T, 'id'>
): Promise<T[]> => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return result as T[];
  } catch (error) {
    console.error('Supabase insert error:', error);
    throw error;
  }
};

// Generic function to handle Supabase updates
export const updateSupabase = async (table: string, id: string, data: any) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Supabase update error:', error);
    throw error;
  }
};

// Generic function to handle Supabase deletes
export const deleteSupabase = async (table: string, id: string) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
};

// Export both Supabase functions and axios instance
export default axiosInstance; 