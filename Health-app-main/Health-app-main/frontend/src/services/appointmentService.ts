import { Appointment, AppointmentCreate, AppointmentUpdate, AppointmentStatus, AppointmentType } from '../types/appointment';
import { supabase } from '../lib/supabase';

// Internal interface to match the database schema
interface DbAppointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  appointment_type?: string; // Added to match the database schema
  duration_minutes?: number; // Added to match the database schema
}

// Convert frontend appointment format to database format
function toDbFormat(appointment: AppointmentCreate): Partial<DbAppointment> {
  // Parse dates from ISO strings
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  
  // Format date as YYYY-MM-DD
  const appointmentDate = startDate.toISOString().split('T')[0];
  
  // Format times as HH:MM:SS
  const startTime = startDate.toTimeString().split(' ')[0];
  const endTime = endDate.toTimeString().split(' ')[0];
  
  // In our updated model, the doctorId is the doctor_profiles.id
  return {
    doctor_id: appointment.doctorId,
    patient_id: appointment.patientId,
    appointment_date: appointmentDate,
    start_time: startTime,
    end_time: endTime,
    status: 'PENDING',
    reason: appointment.reason,
    notes: appointment.notes,
    appointment_type: appointment.type,
    duration_minutes: appointment.duration_minutes || 30 // Default to 30 minutes if not specified
  };
}

// Convert database format to frontend format
function fromDbFormat(dbAppointment: DbAppointment): Appointment {
  // Use start_time and end_time directly as ISO strings
  const startDateTime = dbAppointment.start_time;
  const endDateTime = dbAppointment.end_time;

  return {
    id: dbAppointment.id,
    title: dbAppointment.reason || 'Appointment',
    startTime: new Date(startDateTime).toISOString(),
    endTime: new Date(endDateTime).toISOString(),
    status: dbAppointment.status as AppointmentStatus,
    type: AppointmentType.IN_PERSON, // Default to IN_PERSON since it's not stored in DB
    doctor: {
      id: dbAppointment.doctor_id,
      name: '', // Will need to be populated separately
      specialty: ''
    },
    reason: dbAppointment.reason,
    notes: dbAppointment.notes,
    history: [
      {
        timestamp: dbAppointment.created_at,
        action: 'CREATED',
        by: 'System'
      }
    ]
  };
}

// After creating an appointment, send notification to the doctor by getting user_id from doctor_profiles
async function notifyDoctor(doctorProfileId: string, appointmentDetails: any): Promise<void> {
  try {
    // First, get the user_id from doctor_profiles
    const { data: doctorProfile, error: profileError } = await supabase
      .from('doctor_profiles')
      .select('user_id')
      .eq('id', doctorProfileId)
      .single();
      
    if (profileError) {
      console.error('Error fetching doctor profile:', profileError);
      return;
    }
    
    if (!doctorProfile || !doctorProfile.user_id) {
      console.error('Doctor profile not found or user_id missing');
      return;
    }
    
    // Create a notification for the user (doctor)
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: doctorProfile.user_id,
        title: 'New Appointment Scheduled',
        message: `New appointment on ${appointmentDetails.appointment_date} at ${appointmentDetails.start_time}`,
        type: 'APPOINTMENT',
        is_read: false,
        data: { appointmentId: appointmentDetails.id }
      });
      
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
  } catch (err) {
    console.error('Failed to send notification to doctor:', err);
  }
}

export const appointmentService = {
  // Create a new appointment
  async create(appointment: AppointmentCreate): Promise<Appointment> {
    // We're now passing the doctor_profiles.id directly as the doctor_id
    const dbAppointment = toDbFormat(appointment);
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([dbAppointment])
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      throw new Error(error.message || 'Failed to create appointment');
    }

    // Send notification to the doctor using doctor_profiles.id
    if (appointment.doctorId) {
      await notifyDoctor(appointment.doctorId, data);
    }

    return fromDbFormat(data as DbAppointment);
  },

  // Get appointments with optional filters
  async getAppointments(params: {
    start_date?: string;
    end_date?: string;
    doctor_id?: string;
    patient_id?: string;
    status?: AppointmentStatus[];
  }): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctor_id (
          id,
          full_name
        )
      `);
    
    // Apply filters
    if (params.start_date) {
      query = query.gte('appointment_date', params.start_date);
    }
    
    if (params.end_date) {
      query = query.lte('appointment_date', params.end_date);
    }
    
    if (params.doctor_id) {
      query = query.eq('doctor_id', params.doctor_id);
    }
    
    if (params.patient_id) {
      query = query.eq('patient_id', params.patient_id);
    }
    
    if (params.status && params.status.length > 0) {
      query = query.in('status', params.status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
      throw new Error(error.message || 'Failed to fetch appointments');
    }
    
    // Transform the data to match the Appointment interface
    return (data || []).map(item => {
      const appointment = fromDbFormat(item as unknown as DbAppointment);
      
      // Add doctor details if available - navigate through the nested structure
      if (item.doctor) {
        appointment.doctor.name = item.doctor.full_name;
      }
      
      return appointment;
    });
  },

  // Check slot availability
  async checkAvailability(params: {
    doctor_id: string;
    date: string;
    duration?: number;
  }): Promise<boolean> {
    const appointmentDate = new Date(params.date).toISOString().split('T')[0];
    
    // Get all appointments for the doctor on that day
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', params.doctor_id)
      .eq('appointment_date', appointmentDate);
    
    if (error) {
      console.error('Error checking availability:', error);
      throw new Error(error.message || 'Failed to check availability');
    }
    
    // For simplicity, just return true if there are less than 8 appointments that day
    return (data?.length || 0) < 8;
  },

  // Get available time slots
  async getAvailableSlots(params: {
    doctor_id: string;
    date: string;
    duration?: number;
  }): Promise<string[]> {
    const appointmentDate = new Date(params.date).toISOString().split('T')[0];
    
    // Get all appointments for the doctor on that day
    const { data, error } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('doctor_id', params.doctor_id)
      .eq('appointment_date', appointmentDate);
    
    if (error) {
      console.error('Error fetching slots:', error);
      throw new Error(error.message || 'Failed to fetch available slots');
    }
    
    // Generate time slots from 9 AM to 5 PM in 30-minute increments
    const slots: string[] = [];
    const slotDuration = 30; // minutes
    const appointmentDuration = params.duration || 30; // minutes
    
    // Create date object for the selected date
    const date = new Date(params.date);
    
    // Business hours: 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Skip slots that are in the past
        if (slotTime < new Date()) continue;
        
        // Extract time part for comparison
        const slotTimeStr = slotTime.toTimeString().split(' ')[0];
        
        // Check if slot overlaps with existing appointments
        const isAvailable = !data?.some(apt => {
          // Convert appointment times to Date objects for easier comparison
          const aptStartTime = apt.start_time;
          const aptEndTime = apt.end_time;
          
          // Calculate slot end time
          const slotMinutes = hour * 60 + minute;
          const slotEndMinutes = slotMinutes + appointmentDuration;
          const slotEndHour = Math.floor(slotEndMinutes / 60);
          const slotEndMinute = slotEndMinutes % 60;
          
          // Format slot end time as HH:MM:SS
          const slotEndTimeStr = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}:00`;
          
          return (
            (slotTimeStr >= aptStartTime && slotTimeStr < aptEndTime) ||
            (slotEndTimeStr > aptStartTime && slotEndTimeStr <= aptEndTime) ||
            (slotTimeStr <= aptStartTime && slotEndTimeStr >= aptEndTime)
          );
        });
        
        if (isAvailable) {
          // Format: YYYY-MM-DDTHH:MM:SS
          const isoString = `${date.toISOString().split('T')[0]}T${slotTimeStr}`;
          slots.push(isoString);
        }
      }
    }
    
    return slots;
  },

  // Update an appointment
  async update(id: string, appointment: AppointmentUpdate): Promise<Appointment> {
    // Convert appointment data to DB format if needed
    const dbAppointment: Partial<DbAppointment> = {};
    
    if (appointment.startTime || appointment.endTime) {
      if (appointment.startTime) {
        const startDate = new Date(appointment.startTime);
        dbAppointment.appointment_date = startDate.toISOString().split('T')[0];
        dbAppointment.start_time = startDate.toTimeString().split(' ')[0];
      }
      
      if (appointment.endTime) {
        const endDate = new Date(appointment.endTime);
        dbAppointment.end_time = endDate.toTimeString().split(' ')[0];
      }
    }
    
    // Copy over other fields
    if (appointment.doctorId) dbAppointment.doctor_id = appointment.doctorId;
    if (appointment.reason !== undefined) dbAppointment.reason = appointment.reason;
    if (appointment.notes !== undefined) dbAppointment.notes = appointment.notes;
    
    const { data, error } = await supabase
      .from('appointments')
      .update(dbAppointment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating appointment:', error);
      throw new Error(error.message || 'Failed to update appointment');
    }
    
    return fromDbFormat(data as DbAppointment);
  },

  // Cancel an appointment
  async cancel(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'CANCELLED' })
      .eq('id', id);
    
    if (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error(error.message || 'Failed to cancel appointment');
    }
  },
}; 