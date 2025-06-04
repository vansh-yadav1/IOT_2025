import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main application', () => {
  render(<App />);
  expect(screen.getByText(/Hospital Management System/i)).toBeInTheDocument();
}); 