// API Response Types
export interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: string;
}

export interface HealthMetrics {
  HEART_RATE?: number;
  BLOOD_PRESSURE_SYSTOLIC?: number;
  BLOOD_PRESSURE_DIASTOLIC?: number;
  OXYGEN_LEVEL?: number;
  TEMPERATURE?: number;
} 