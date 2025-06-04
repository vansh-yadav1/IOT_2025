import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

// Define appointment types
export interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  type: 'IN_PERSON' | 'VIRTUAL';
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  reason?: string;
  notes?: string;
  location?: string;
  meetingLink?: string;
  instructions?: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  history: {
    timestamp: string;
    action: string;
    by: string;
  }[];
}

export interface AppointmentFormData {
  title: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  type: 'IN_PERSON' | 'VIRTUAL';
  reason?: string;
  notes?: string;
  location?: string;
  meetingLink?: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
}

// Mock appointment data
const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Annual Physical Examination',
    startTime: '2023-06-15T09:00:00',
    endTime: '2023-06-15T10:00:00',
    status: 'SCHEDULED',
    type: 'IN_PERSON',
    doctor: {
      id: 'dr1',
      name: 'Dr. John Smith',
      specialty: 'General Practitioner'
    },
    reason: 'Annual check-up and health assessment',
    notes: 'Patient requested blood work to be done during this visit.',
    location: 'Main Hospital - Room 302',
    instructions: 'Please arrive 15 minutes early to complete paperwork. Bring your insurance card and ID.',
    insurance: {
      provider: 'BlueCross BlueShield',
      policyNumber: 'BC12345678',
      groupNumber: 'G9876543'
    },
    history: [
      { timestamp: '2023-05-20T14:30:00', action: 'CREATED', by: 'Patient Portal' },
      { timestamp: '2023-05-22T09:15:00', action: 'CONFIRMED', by: 'SMS' }
    ]
  },
  {
    id: '2',
    title: 'Cardiology Consultation',
    startTime: '2023-06-20T11:00:00',
    endTime: '2023-06-20T12:00:00',
    status: 'CONFIRMED',
    type: 'IN_PERSON',
    doctor: {
      id: 'dr2',
      name: 'Dr. Emily Chen',
      specialty: 'Cardiology'
    },
    reason: 'Follow-up on recent abnormal ECG',
    notes: 'Patient has been experiencing chest pain and shortness of breath.',
    location: 'Cardiology Center - Suite 405',
    instructions: 'Please do not eat or drink anything except water for 4 hours before your appointment.',
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET98765432',
      groupNumber: 'A1234567'
    },
    history: [
      { timestamp: '2023-06-01T10:20:00', action: 'CREATED', by: 'Referral' },
      { timestamp: '2023-06-02T15:45:00', action: 'CONFIRMED', by: 'Phone' }
    ]
  },
  {
    id: '3',
    title: 'Telemedicine Appointment',
    startTime: '2023-06-25T14:00:00',
    endTime: '2023-06-25T14:30:00',
    status: 'SCHEDULED',
    type: 'VIRTUAL',
    doctor: {
      id: 'dr3',
      name: 'Dr. Maria Rodriguez',
      specialty: 'Family Medicine'
    },
    reason: 'Medication review and refill request',
    notes: 'Patient needs prescription refill for hypertension medication.',
    meetingLink: 'https://telehealth.hospital.com/room/12345',
    instructions: 'Log in to the patient portal 10 minutes before your appointment to test your connection.',
    insurance: {
      provider: 'United Healthcare',
      policyNumber: 'UHC87654321'
    },
    history: [
      { timestamp: '2023-06-10T09:30:00', action: 'CREATED', by: 'Patient Portal' }
    ]
  }
];

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useNotification();

  // Fetch all appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(mockAppointments);
      return mockAppointments;
    } catch (err) {
      const error = err as Error;
      setError(error);
      showNotification(error.message, 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments
  };
};

// Create appointment hook for creating new appointments
export const useCreateAppointment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useNotification();

  const createAppointment = async (appointmentData: AppointmentFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new appointment with generated ID and initial status
      const newAppointment: Appointment = {
        id: `${Date.now()}`, // Generate a unique ID
        ...appointmentData,
        status: 'SCHEDULED',
        doctor: mockAppointments[0].doctor, // This would be fetched based on doctorId in a real app
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'CREATED',
            by: 'Patient Portal'
          }
        ]
      };
      
      showNotification('Appointment created successfully', 'success');
      return newAppointment;
    } catch (err) {
      const error = err as Error;
      setError(error);
      showNotification(`Failed to create appointment: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createAppointment,
    loading,
    error
  };
};

// Update appointment hook for modifying existing appointments
export const useUpdateAppointment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useNotification();

  const updateAppointment = async (appointmentId: string, appointmentData: Partial<AppointmentFormData>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the appointment to update
      const existingAppointment = mockAppointments.find(a => a.id === appointmentId);
      if (!existingAppointment) {
        throw new Error('Appointment not found');
      }
      
      // Update the appointment
      const updatedAppointment: Appointment = {
        ...existingAppointment,
        ...appointmentData,
        history: [
          ...existingAppointment.history,
          {
            timestamp: new Date().toISOString(),
            action: 'UPDATED',
            by: 'Patient Portal'
          }
        ]
      };
      
      showNotification('Appointment updated successfully', 'success');
      return updatedAppointment;
    } catch (err) {
      const error = err as Error;
      setError(error);
      showNotification(`Failed to update appointment: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateAppointment,
    loading,
    error
  };
};

export default useAppointments; 