import React, { ReactNode } from 'react';
export const Button = ({ children, ...props }: { children: ReactNode, [key: string]: any }) => <button {...props}>{children}</button>;
export default Button; 