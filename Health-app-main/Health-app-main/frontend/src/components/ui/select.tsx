import React, { ReactNode } from 'react';
export const Select = (props: { children: ReactNode; [key: string]: any }) => <select {...props}>{props.children}</select>;
export default Select; 