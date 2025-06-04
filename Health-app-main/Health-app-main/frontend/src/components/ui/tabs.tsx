import React, { ReactNode } from 'react';

type TabsProps = {
  value: any;
  onValueChange: (val: any) => void;
  children: ReactNode;
};

type TabsListProps = {
  children: ReactNode;
  [key: string]: any;
};

type TabsTriggerProps = {
  value: any;
  activeTab?: any;
  onTabChange?: (val: any) => void;
  children: ReactNode;
  [key: string]: any;
};

type TabsContentProps = {
  value: any;
  activeTab?: any;
  children: ReactNode;
  [key: string]: any;
};

export const Tabs = ({ value, onValueChange, children }: TabsProps) => {
  // Only pass known props to children
  return (
    <div>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { activeTab: value, onTabChange: onValueChange } as any)
          : child
      )}
    </div>
  );
};

export const TabsList = ({ children, ...props }: TabsListProps) => (
  <div style={{ display: 'flex', gap: 8 }} {...props}>{children}</div>
);

export const TabsTrigger = ({ value, activeTab, onTabChange, children, ...props }: TabsTriggerProps) => (
  <button
    style={{ fontWeight: activeTab === value ? 'bold' : 'normal', marginRight: 8 }}
    onClick={() => onTabChange && onTabChange(value)}
    {...props}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, activeTab, children, ...props }: TabsContentProps) => (
  activeTab === value ? <div {...props}>{children}</div> : null
); 