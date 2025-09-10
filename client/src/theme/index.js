import { createTheme } from '@mui/material/styles';

// Color palette following Material Design 3 principles
const lightColors = {
  primary: {
    main: '#1976D2',
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9C27B0',
    light: '#BA68C8',
    dark: '#7B1FA2',
    contrastText: '#ffffff',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
  },
  warning: {
    main: '#ED6C02',
    light: '#FF9800',
    dark: '#E65100',
  },
  info: {
    main: '#0288D1',
    light: '#03DAC6',
    dark: '#01579B',
  },
  success: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    surface: '#F5F5F5',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
};

const darkColors = {
  primary: {
    main: '#90CAF9',
    light: '#E3F2FD',
    dark: '#42A5F5',
    contrastText: '#000000',
  },
  secondary: {
    main: '#CE93D8',
    light: '#F3E5F5',
    dark: '#AB47BC',
    contrastText: '#000000',
  },
  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#C62828',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  info: {
    main: '#29B6F6',
    light: '#4FC3F7',
    dark: '#0288D1',
  },
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#388E3C',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    surface: '#2D2D2D',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
};

// Custom difficulty colors
const difficultyColors = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#F44336',
};

// Modern typography scale
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
  button: {
    fontWeight: 500,
    textTransform: 'none',
    letterSpacing: '0.02857em',
  },
};

// Modern spacing system
const spacing = (factor) => `${0.25 * factor}rem`;

// Component style overrides
const getComponents = (mode) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0px 2px 4px rgba(0, 0, 0, 0.1)' 
            : '0px 2px 4px rgba(255, 255, 255, 0.1)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0px 4px 8px rgba(0, 0, 0, 0.15)' 
            : '0px 4px 8px rgba(255, 255, 255, 0.15)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'light' 
          ? '0px 2px 8px rgba(0, 0, 0, 0.1)' 
          : '0px 2px 8px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'light' 
          ? '0px 2px 8px rgba(0, 0, 0, 0.08)' 
          : '0px 2px 8px rgba(0, 0, 0, 0.25)',
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0px 4px 16px rgba(0, 0, 0, 0.12)' 
            : '0px 4px 16px rgba(0, 0, 0, 0.35)',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderBottom: mode === 'light' 
          ? '1px solid rgba(0, 0, 0, 0.12)' 
          : '1px solid rgba(255, 255, 255, 0.12)',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: mode === 'light' 
          ? '1px solid rgba(0, 0, 0, 0.08)' 
          : '1px solid rgba(255, 255, 255, 0.08)',
      },
    },
  },
});

export const createAppTheme = (mode = 'light') => {
  const colors = mode === 'light' ? lightColors : darkColors;
  
  return createTheme({
    palette: {
      mode,
      ...colors,
      difficulty: difficultyColors,
    },
    typography,
    spacing,
    shape: {
      borderRadius: 8,
    },
    components: getComponents(mode),
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  });
};

export default createAppTheme;
