import { createTheme } from '@mui/material/styles';

const purpleTheme = createTheme({
  palette: {
    primary: {
      main: '#7c3aed', // purple-600
      light: '#a78bfa', // purple-400
      dark: '#6d28d9', // purple-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // purple-500
      light: '#c4b5fd', // purple-300
      dark: '#5b21b6', // purple-800
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9f9ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e1b4b', // indigo-950
      secondary: '#4c1d95', // purple-900
    },
    error: {
      main: '#ef4444', // red-500
    },
    warning: {
      main: '#f59e0b', // amber-500
    },
    info: {
      main: '#3b82f6', // blue-500
    },
    success: {
      main: '#10b981', // emerald-500
    },
    divider: 'rgba(139, 92, 246, 0.12)',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
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
      fontWeight: 600,
      color: '#a78bfa',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
          '&:hover': {
            backgroundImage: 'linear-gradient(to right, #7c3aed, #6d28d9)',
            boxShadow: '0 4px 8px rgba(124, 58, 237, 0.25)',
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
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
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
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});

export default purpleTheme; 