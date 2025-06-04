import axios from 'axios';
import { login, logout, getCurrentUser, isAuthenticated } from './auth';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth Service Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.performance.clearMarks();
    window.performance.clearMeasures();
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

    window.performance.mark('login-start');
    await login('test@example.com', 'password123');
    window.performance.mark('login-end');
    window.performance.measure('login-time', 'login-start', 'login-end');

    const measures = window.performance.getEntriesByName('login-time');
    expect(measures[0].duration).toBeLessThan(300);
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

    window.performance.mark('concurrent-start');

    for (let i = 0; i < concurrentRequests; i++) {
      loginPromises.push(login(`test${i}@example.com`, 'password123'));
    }

    await Promise.all(loginPromises);

    window.performance.mark('concurrent-end');
    window.performance.measure('concurrent-time', 'concurrent-start', 'concurrent-end');

    const measures = window.performance.getEntriesByName('concurrent-time');
    expect(measures[0].duration).toBeLessThan(concurrentRequests * 100); // 100ms per request
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
    window.performance.mark('storage-start');
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.performance.mark('storage-end');
    window.performance.measure('storage-time', 'storage-start', 'storage-end');

    const storageMeasures = window.performance.getEntriesByName('storage-time');
    expect(storageMeasures[0].duration).toBeLessThan(10);

    // Test token retrieval
    window.performance.mark('retrieval-start');
    const retrievedToken = localStorage.getItem('token');
    const retrievedUser = JSON.parse(localStorage.getItem('user') || '{}');
    window.performance.mark('retrieval-end');
    window.performance.measure('retrieval-time', 'retrieval-start', 'retrieval-end');

    const retrievalMeasures = window.performance.getEntriesByName('retrieval-time');
    expect(retrievalMeasures[0].duration).toBeLessThan(10);
  });

  it('should handle rapid authentication state changes', () => {
    const iterations = 100;
    const stateChanges = [];

    for (let i = 0; i < iterations; i++) {
      window.performance.mark('state-change-start');
      
      if (i % 2 === 0) {
        localStorage.setItem('token', 'mock-token');
      } else {
        localStorage.removeItem('token');
      }
      
      const isAuth = isAuthenticated();
      stateChanges.push(isAuth);
      
      window.performance.mark('state-change-end');
      window.performance.measure('state-change-time', 'state-change-start', 'state-change-end');
    }

    const measures = window.performance.getEntriesByName('state-change-time');
    const averageTime = measures.reduce((sum, measure) => sum + measure.duration, 0) / measures.length;
    
    expect(averageTime).toBeLessThan(5); // Average time should be less than 5ms
  });

  it('should maintain performance during error handling', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    window.performance.mark('error-handling-start');
    try {
      await login('test@example.com', 'wrong-password');
    } catch (error) {
      // Expected error
    }
    window.performance.mark('error-handling-end');
    window.performance.measure('error-handling-time', 'error-handling-start', 'error-handling-end');

    const measures = window.performance.getEntriesByName('error-handling-time');
    expect(measures[0].duration).toBeLessThan(200); // Error handling should complete within 200ms
  });
}); 