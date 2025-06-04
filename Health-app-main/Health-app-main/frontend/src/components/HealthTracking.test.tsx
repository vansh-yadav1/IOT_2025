import { render, screen } from '@testing-library/react';
import HealthTracking from './HealthTracking';

test('renders the health tracking component', () => {
  render(<HealthTracking />);
  expect(screen.getByText(/Health Tracking/i)).toBeInTheDocument();
}); 