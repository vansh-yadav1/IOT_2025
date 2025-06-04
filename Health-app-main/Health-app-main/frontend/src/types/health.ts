export interface MedicationJourney {
  medicineName: string;
  halfLife: number; // in minutes
  fullLife: number; // in minutes
  startTime: number;
}

export interface HealthDataPoint {
  timestamp: number;
  label: 'start' | 'half-life' | 'full-life';
  vitals: {
    heartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    temperature?: number;
    oxygenSaturation?: number;
  };
}

export interface HealthTrackingState {
  journey: MedicationJourney | null;
  dataPoints: HealthDataPoint[];
  isTracking: boolean;
} 