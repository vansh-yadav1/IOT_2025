// Health Metrics Types

export interface ReadingData {
  id: number;
  value: number | string;
  date: string;
  time: string;
  notes: string;
}

export interface MetricDetail {
  id: string;
  name: string;
  currentValue: number | string;
  unit: string;
  normalRange: string;
  description: string;
  lastUpdated: string;
  changeRate: number;
  icon: React.ReactNode;
  iconClass: string;
  readings: ReadingData[];
}

export interface MetricSummary {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconClass: string;
  unit: string;
  current: number | string;
  trend: number;
  normalRange: string;
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      tension?: number;
    }>;
  };
}

export interface MetricFormData {
  value: number;
  date: Date;
  time: Date;
  notes: string;
}

export interface MetricConfig {
  id: string;
  name: string;
  unit: string;
  icon: React.ReactNode;
  iconClass: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export type MetricId = 'heart-rate' | 'blood-pressure' | 'oxygen-level' | 'body-temperature';

export type NotificationType = 'success' | 'info' | 'warning' | 'error'; 