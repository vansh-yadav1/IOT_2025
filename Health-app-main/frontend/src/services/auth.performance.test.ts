import axios from 'axios';
import { login, logout, getCurrentUser } from './auth';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth Service Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should complete login request within 300ms', async () => {
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'PATIENT',
          name: 'Test User'
        }
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const startTime = window.performance.now();
    await login('test@example.com', 'password123');
    const endTime = window.performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(300);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent login requests efficiently', async () => {
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'PATIENT',
          name: 'Test User'
        }
      }
    };

    mockedAxios.post.mockResolvedValue(mockResponse);

    const concurrentRequests = 10;
    const loginPromises = [];
    const startTime = window.performance.now();

    for (let i = 0; i < concurrentRequests; i++) {
      loginPromises.push(login(`test${i}@example.com`, 'password123'));
    }

    await Promise.all(loginPromises);
    const endTime = window.performance.now();
    const totalDuration = endTime - startTime;
    const averageDuration = totalDuration / concurrentRequests;

    expect(averageDuration).toBeLessThan(100);
    expect(mockedAxios.post).toHaveBeenCalledTimes(concurrentRequests);
  });

  it('should perform token operations within 10ms', () => {
    const token = 'mock-token';
    const user = {
      id: '1',
      email: 'test@example.com',
      role: 'PATIENT',
      name: 'Test User'
    };

    // Test token storage
    const storageStartTime = window.performance.now();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    const storageEndTime = window.performance.now();
    const storageDuration = storageEndTime - storageStartTime;

    // Test token retrieval
    const retrievalStartTime = window.performance.now();
    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const retrievalEndTime = window.performance.now();
    const retrievalDuration = retrievalEndTime - retrievalStartTime;

    expect(storageDuration).toBeLessThan(10);
    expect(retrievalDuration).toBeLessThan(10);
    expect(storedToken).toBe(token);
    expect(storedUser).toEqual(user);
  });

  it('should handle rapid authentication state changes', () => {
    const iterations = 100;
    const durations = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = window.performance.now();
      
      if (i % 2 === 0) {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({ id: i }));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      const endTime = window.performance.now();
      durations.push(endTime - startTime);
    }

    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    expect(averageDuration).toBeLessThan(5);
  });

  it('should maintain performance during error handling', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    const startTime = window.performance.now();
    try {
      await login('test@example.com', 'wrong-password');
    } catch (error) {
      // Expected error
    }
    const endTime = window.performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(200);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });
}); 