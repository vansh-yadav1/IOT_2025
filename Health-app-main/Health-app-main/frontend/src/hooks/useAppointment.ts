import { useState, useEffect } from 'react';

// Mock appointment data
const mockAppointments = [
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

export const useAppointment = (appointmentId?: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (!appointmentId) {
      setIsLoading(false);
      return;
    }

    // Simulate API fetch
    const fetchAppointment = async () => {
      try {
        setIsLoading(true);
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const appointment = mockAppointments.find(apt => apt.id === appointmentId);
        if (!appointment) {
          throw new Error('Appointment not found');
        }
        
        setData(appointment);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const updateAppointmentStatus = async (newStatus: string) => {
    if (!data) return;
    
    try {
      setIsUpdating(true);
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      const updatedAppointment = {
        ...data,
        status: newStatus,
        history: [
          ...data.history,
          {
            timestamp: new Date().toISOString(),
            action: newStatus,
            by: 'Staff Portal'
          }
        ]
      };
      
      setData(updatedAppointment);
      return updatedAppointment;
    } catch (err) {
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelAppointment = async () => {
    if (!data) return;
    
    try {
      setIsUpdating(true);
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      const updatedAppointment = {
        ...data,
        status: 'CANCELLED',
        history: [
          ...data.history,
          {
            timestamp: new Date().toISOString(),
            action: 'CANCELLED',
            by: 'Staff Portal'
          }
        ]
      };
      
      setData(updatedAppointment);
      return updatedAppointment;
    } catch (err) {
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    isUpdating,
    updateAppointmentStatus,
    cancelAppointment
  };
};

export default useAppointment; 