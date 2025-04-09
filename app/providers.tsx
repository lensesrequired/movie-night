'use client';

import { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
