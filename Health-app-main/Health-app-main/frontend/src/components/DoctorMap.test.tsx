import { render, screen } from '@testing-library/react';
import DoctorMap from './DoctorMap';

test('renders the doctor map component', () => {
  render(<DoctorMap />);
  expect(screen.getByText(/Doctor Map/i)).toBeInTheDocument();
}); 