import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  hideNotification: () => {}
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<NotificationType>('info');

  const showNotification = (message: string, type: NotificationType) => {
    setMessage(message);
    setType(type);
    setOpen(true);
  };

  const hideNotification = () => {
    setOpen(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        hideNotification
      }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hideNotification} severity={type} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 