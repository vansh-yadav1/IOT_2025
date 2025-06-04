import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Sidebar from './Sidebar';

test('renders the sidebar navigation', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Sidebar open={true} onClose={() => {}} variant="permanent" />
      </AuthProvider>
    </BrowserRouter>
  );
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Appointments/i)).toBeInTheDocument();
  expect(screen.getByText(/Health Metrics/i)).toBeInTheDocument();
}); 