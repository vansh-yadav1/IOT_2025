import React from 'react';
import ActivityRing from './ActivityRing';

interface ActivityRingsProps {
  move?: number; // Value between 0 and 1
  exercise?: number; // Value between 0 and 1
  stand?: number; // Value between 0 and 1
  size?: number;
  showLabels?: boolean;
}

const ActivityRings: React.FC<ActivityRingsProps> = ({
  move = 0,
  exercise = 0,
  stand = 0,
  size = 120,
  showLabels = true,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
      <ActivityRing
        value={move}
        size={size}
        thickness={size * 0.1}
        color="#FF3B30"
        label={showLabels ? "Move" : undefined}
      />
      
      <ActivityRing
        value={exercise}
        size={size}
        thickness={size * 0.1}
        color="#4CD964"
        label={showLabels ? "Exercise" : undefined}
      />
      
      <ActivityRing
        value={stand}
        size={size}
        thickness={size * 0.1}
        color="#007AFF"
        label={showLabels ? "Stand" : undefined}
      />
    </div>
  );
};

export default ActivityRings; 