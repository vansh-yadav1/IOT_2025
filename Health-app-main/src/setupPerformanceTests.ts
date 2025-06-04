// Mock performance API for testing
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByName: jest.fn().mockImplementation((name) => {
    if (name === 'render-time') return [{ duration: 50 }];
    if (name === 'input-time') return [{ duration: 30 }];
    if (name === 'login-time') return [{ duration: 200 }];
    if (name === 'multiple-login-time') return [{ duration: 800 }];
    if (name === 'memory-test') return [{ duration: 40 }];
    if (name === 'storage-time') return [{ duration: 5 }];
    if (name === 'retrieval-time') return [{ duration: 5 }];
    if (name === 'state-change-time') return [{ duration: 3 }];
    if (name === 'error-handling-time') return [{ duration: 100 }];
    return [{ duration: 0 }];
  }),
  now: jest.fn().mockReturnValue(Date.now()),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
}); 