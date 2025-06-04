import React, { ReactNode } from 'react';
export const Table = ({ children }: { children: ReactNode }) => <table>{children}</table>;
export const TableHeader = ({ children }: { children: ReactNode }) => <thead>{children}</thead>;
export const TableBody = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;
export const TableRow = ({ children }: { children: ReactNode }) => <tr>{children}</tr>;
export const TableHead = ({ children }: { children: ReactNode }) => <th>{children}</th>;
export const TableCell = ({ children }: { children: ReactNode }) => <td>{children}</td>; 