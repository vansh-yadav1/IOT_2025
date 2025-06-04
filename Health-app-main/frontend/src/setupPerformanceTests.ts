// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByName: jest.fn(() => [{ duration: 50 }]),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true
});

// Mock localStorage with in-memory store
let store: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { store = {}; },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Reset mocks before each test
beforeEach(() => {
  mockPerformance.now.mockClear();
  mockPerformance.mark.mockClear();
  mockPerformance.measure.mockClear();
  mockPerformance.clearMarks.mockClear();
  mockPerformance.clearMeasures.mockClear();
  mockPerformance.getEntriesByName.mockClear();
  store = {}; // Clear the in-memory store
}); 