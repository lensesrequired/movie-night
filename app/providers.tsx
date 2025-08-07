'use client';

import { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import themeVals from '../material-theme.json';

const theme = createTheme({
  ...themeVals,
  palette: {
    mode: 'dark',
    ...themeVals.palettes,
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
