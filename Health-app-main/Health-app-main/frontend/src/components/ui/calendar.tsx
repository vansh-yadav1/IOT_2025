import React from 'react';
export const Calendar = ({ selected, onSelect, ...props }: { selected: Date; onSelect: (date: Date) => void; [key: string]: any }) => (
  <input
    type="date"
    value={selected ? selected.toISOString().substr(0, 10) : ''}
    onChange={e => onSelect && onSelect(new Date(e.target.value))}
    {...props}
  />
);
export default Calendar; 