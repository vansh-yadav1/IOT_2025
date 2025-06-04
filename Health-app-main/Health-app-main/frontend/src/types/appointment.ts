export enum AppointmentStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum AppointmentType {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL'
}

// Frontend appointment format used in UI
export interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  patientId?: string;
  doctor_id?: string; // For backward compatibility
  patient_id?: string; // For backward compatibility 
  appointment_date?: string; // For backward compatibility
  appointment_type?: string; // For backward compatibility
  duration_minutes?: number; // For backward compatibility
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

// Data needed to create a new appointment
export interface AppointmentCreate {
  title?: string;
  doctorId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  reason?: string;
  notes?: string;
  location?: string;
  meetingLink?: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  // Backward compatibility fields
  doctor_id?: string;
  patient_id?: string;
  appointment_type?: AppointmentType;
  duration_minutes?: number;
}

// Fields that can be updated
export interface AppointmentUpdate {
  title?: string;
  doctorId?: string;
  startTime?: string;
  endTime?: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  location?: string;
  meetingLink?: string;
} 