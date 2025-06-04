import React from 'react';

interface ActivityRingProps {
  value: number; // Value between 0 and 1
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  labelColor?: string;
  showValue?: boolean;
}

const ActivityRing: React.FC<ActivityRingProps> = ({
  value,
  size = 100,
  thickness = 10,
  color = '#ff0000',
  backgroundColor = 'rgba(0,0,0,0.1)',
  label,
  labelColor = '#333',
  showValue = true,
}) => {
  // Ensure value is between 0 and 1
  const normalizedValue = Math.min(Math.max(value, 0), 1);
  
  // Calculate circle parameters
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const circumference = 2 * Math.PI * innerRadius;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (normalizedValue * circumference);
  
  // Calculate center positions
  const center = size / 2;
  
  // Format percentage
  const percentage = Math.round(normalizedValue * 100);
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={thickness}
        />
        
        {/* Progress Circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
        
        {/* Label in the middle */}
        {showValue && (
          <text 
            x={center} 
            y={center} 
            textAnchor="middle" 
            dominantBaseline="middle"
            fill={labelColor}
            fontSize={size / 5}
            fontWeight="bold"
          >
            {percentage}%
          </text>
        )}
      </svg>
      
      {/* Label below the ring */}
      {label && (
        <div 
          style={{ 
            position: 'absolute',
            bottom: -30,
            width: '100%',
            textAlign: 'center',
            color: labelColor,
            fontSize: size / 8,
            fontWeight: 'bold'
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default ActivityRing; 