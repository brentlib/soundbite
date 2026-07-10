import { createTheme } from '@mui/material/styles';

// Modern dark theme with a neon synthwave accent.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00d4ff' },
    secondary: { main: '#5b8def' },
    background: { default: '#0e1116', paper: '#171b22' },
    text: { primary: '#e6e8eb', secondary: '#9aa4b2' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid rgba(255,255,255,0.06)' },
      },
    },
  },
});

export default theme;
