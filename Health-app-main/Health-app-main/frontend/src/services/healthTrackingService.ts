import { MedicationJourney, HealthDataPoint } from '../types/health';

// Fetch health data from real API summary endpoint (commented out for now)
// const fetchHealthData = async (userId: string): Promise<HealthDataPoint['vitals']> => {
//   const response = await fetch(`http://localhost:8000/wearable/summary/${userId}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       // Add authentication headers here if needed
//     },
//   });
//
//   if (!response.ok) {
//     throw new Error('Failed to fetch health data');
//   }
//
//   const data = await response.json();
//   return {
//     heartRate: data.heart_rate?.average_hr,
//     bloodPressure: undefined, // Not available in summary
//     temperature: undefined,   // Not available in summary
//     oxygenSaturation: data.blood_oxygen?.average,
//   };
// };

// Mock function to simulate fetching health data
const fetchHealthData = async (_userId: string): Promise<HealthDataPoint['vitals']> => {
  return {
    heartRate: Math.floor(Math.random() * 40) + 60, // Random heart rate between 60-100
    bloodPressure: {
      systolic: Math.floor(Math.random() * 30) + 110, // Random systolic between 110-140
      diastolic: Math.floor(Math.random() * 20) + 70, // Random diastolic between 70-90
    },
    temperature: 36.5 + (Math.random() * 0.5), // Random temperature between 36.5-37.0
    oxygenSaturation: Math.floor(Math.random() * 5) + 95, // Random O2 sat between 95-100
  };
};

export const startHealthTracking = async (
  journey: MedicationJourney,
  onDataPoint: (dataPoint: HealthDataPoint) => void,
  userId: string
): Promise<void> => {
  const { startTime, halfLife, fullLife } = journey;
  
  // T0 - Start
  const startData = await fetchHealthData(userId);
  onDataPoint({
    timestamp: startTime,
    label: 'start',
    vitals: startData,
  });

  // T1 - Half Life
  setTimeout(async () => {
    const halfLifeData = await fetchHealthData(userId);
    onDataPoint({
      timestamp: startTime + (halfLife * 60 * 1000),
      label: 'half-life',
      vitals: halfLifeData,
    });
  }, halfLife * 60 * 1000);

  // T2 - Full Life
  setTimeout(async () => {
    const fullLifeData = await fetchHealthData(userId);
    onDataPoint({
      timestamp: startTime + (fullLife * 60 * 1000),
      label: 'full-life',
      vitals: fullLifeData,
    });
  }, fullLife * 60 * 1000);
}; 