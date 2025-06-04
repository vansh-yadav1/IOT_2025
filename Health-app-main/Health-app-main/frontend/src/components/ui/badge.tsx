import React, { ReactNode } from 'react';
export const Badge = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => <span {...props} style={{ padding: '2px 8px', background: '#eee', borderRadius: 4 }}>{children}</span>;
export default Badge; 