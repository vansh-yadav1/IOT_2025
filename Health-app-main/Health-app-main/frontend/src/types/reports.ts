export interface Report {
  id: string;
  test_health_id: string;
  pdf_path: string;
  created_at: string;
  medicine: string;
  half_life: number;
  full_life: number;
  user_id: string;
}

export interface TestHealthReport {
  id: string;
  user_id: string;
  created_at: string;
  medicine: string;
  half_life: number;
  full_life: number;
  data: HealthDataPoint[];
}

export interface HealthDataPoint {
  time: string;
  timestamp: string;
  minutes: number;
  heartRate: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  o2: number;
} 