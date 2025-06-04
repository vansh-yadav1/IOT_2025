import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { Appointment, AppointmentCreate, AppointmentStatus, AppointmentType } from '../types/appointment';
import { supabase } from '../lib/supabase';

// AppointmentFormData for form handling
export interface AppointmentFormData extends Omit<AppointmentCreate, 'startTime' | 'endTime'> {
  startTime: Date | null | string;
  endTime: Date | null | string;
  status?: AppointmentStatus; // Added status field for editing existing appointments
}

// Fallback mock data if needed
const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Annual Physical Examination',
    startTime: '2023-06-15T09:00:00',
    endTime: '2023-06-15T10:00:00',
    status: AppointmentStatus.SCHEDULED,
    type: 'IN_PERSON' as any,
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
    status: AppointmentStatus.CONFIRMED,
    type: 'IN_PERSON' as any,
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
    status: AppointmentStatus.SCHEDULED,
    type: 'VIRTUAL' as any,
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
  const { user } = useAuth();

  // Fetch all appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedAppointments: Appointment[];
      
      if (user) {
        // If user exists, fetch from Supabase based on role
        if (user.role === 'DOCTOR') {
          // Get doctor's appointments
          fetchedAppointments = await appointmentService.getAppointments({
            doctor_id: user.id
          });
        } else {
          // Get patient's appointments
          fetchedAppointments = await appointmentService.getAppointments({
            patient_id: user.id
          });
        }
      } else {
        // Fallback to mock data if no user (should not happen in production)
        fetchedAppointments = mockAppointments;
      }
      
      setAppointments(fetchedAppointments);
      return fetchedAppointments;
    } catch (err) {
      const error = err as Error;
      setError(error);
      showNotification(error.message, 'error');
      
      // Fallback to mock data on error
      setAppointments(mockAppointments);
      return mockAppointments;
    } finally {
      setLoading(false);
    }
  }, [showNotification, user]);

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
  const { user } = useAuth();

  const createAppointment = async (appointmentData: AppointmentFormData) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      
      // Important: doctorId must be a valid doctor_profile.id
      // Ensure startTime and endTime are ISO strings
      const formattedData: AppointmentCreate = {
        ...appointmentData,
        // If startTime or endTime are Date objects, convert them to ISO strings
        startTime: typeof appointmentData.startTime === 'object' 
          ? (appointmentData.startTime as Date).toISOString() 
          : appointmentData.startTime as string,
        endTime: typeof appointmentData.endTime === 'object'
          ? (appointmentData.endTime as Date).toISOString()
          : appointmentData.endTime as string,
        patientId: user.id, // This assumes user is the patient
        doctorId: appointmentData.doctorId // This must be a doctor_profile.id
      };
      
      // Create appointment in Supabase
      const newAppointment = await appointmentService.create(formattedData);
      
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
      // Convert any date objects to ISO strings
      const formattedData: any = { ...appointmentData };
      
      if (appointmentData.startTime instanceof Date) {
        formattedData.startTime = appointmentData.startTime.toISOString();
      }
      
      if (appointmentData.endTime instanceof Date) {
        formattedData.endTime = appointmentData.endTime.toISOString();
      }
      
      // Update appointment in Supabase
      const updatedAppointment = await appointmentService.update(appointmentId, formattedData);
      
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

// Get a single appointment by ID
export const useAppointment = (appointmentId: string | undefined) => {
  const [data, setData] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      
      setIsLoading(true);
      try {
        // Get all appointments first (we'll optimize this later)
        const { data: appointments } = await supabase
          .from('appointments')
          .select('*, doctor:doctor_id(id, user:user_id(full_name))')
          .eq('id', appointmentId)
          .single();

        if (!appointments) {
          throw new Error('Appointment not found');
        }

        // Format the data
        const appointment = appointments as any;
        
        // Build the formatted appointment
        const formattedAppointment: Appointment = {
          id: appointment.id,
          title: appointment.reason || 'Appointment',
          startTime: `${appointment.appointment_date}T${appointment.start_time}`,
          endTime: `${appointment.appointment_date}T${appointment.end_time}`,
          status: appointment.status as AppointmentStatus,
          type: AppointmentType.IN_PERSON, // Default since we don't store this
          doctor: {
            id: appointment.doctor_id,
            name: appointment.doctor?.user?.full_name || 'Unknown Doctor',
            specialty: ''
          },
          doctor_id: appointment.doctor_id,
          patient_id: appointment.patient_id,
          reason: appointment.reason,
          notes: appointment.notes,
          location: '',
          history: [
            {
              timestamp: appointment.created_at,
              action: 'CREATED',
              by: 'System'
            }
          ]
        };

        setData(formattedAppointment);
      } catch (err) {
        const error = err as Error;
        setError(error);
        showNotification(`Error fetching appointment: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, showNotification]);

  return { data, isLoading, error };
};

export default useAppointments; 