import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#c4b5fd',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#f9f9ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e1b4b',
      secondary: '#4c1d95',
    },
    divider: 'rgba(139, 92, 246, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#4c1d95',
    },
    h2: {
      fontWeight: 700,
      color: '#5b21b6',
    },
    h3: {
      fontWeight: 600,
      color: '#6d28d9',
    },
    h4: {
      fontWeight: 600,
      color: '#7c3aed',
    },
    h5: {
      fontWeight: 600,
      color: '#8b5cf6',
    },
    h6: {
      fontWeight: 500,
      color: '#a78bfa',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: '8px',
          fontWeight: 500,
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(124, 58, 237, 0.2)',
          },
        },
        contained: {
          backgroundImage: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
          '&:hover': {
            backgroundImage: 'linear-gradient(to right, #7c3aed, #6d28d9)',
            boxShadow: '0px 4px 8px rgba(124, 58, 237, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -1px rgba(124, 58, 237, 0.06)',
          border: '1px solid rgba(139, 92, 246, 0.08)',
          overflow: 'visible',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(124, 58, 237, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(124, 58, 237, 0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(245, 243, 255, 0.7)',
          color: '#5b21b6',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            fontWeight: 600,
            color: '#7c3aed',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '8px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to right, #7c3aed, #8b5cf6)',
        },
      },
    },
  },
});
