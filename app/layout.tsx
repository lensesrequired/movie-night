import { Providers } from '@/app/providers';
import { ProfileMenu } from '@/components/ProfileMenu';
import { getAuth } from '@/components/withAuth';
import type { Metadata } from 'next';
import { Spectral } from 'next/font/google';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Box, Link as MLink, Stack, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import './globals.scss';

const spectral = Spectral({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CineMates',
  description: 'For watchlists with friends!',
};

async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const authProps = await getAuth();

  return (
    <html lang="en">
      <Providers>
        <body className={`${spectral.className}`}>
          <div style={{ minHeight: '80vh' }}>
            <Paper
              elevation={16}
              sx={{
                py: 1,
                px: 2,
                m: 1,
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: 'primary.900',
                borderRadius: '.5rem',
              }}
            >
              <Link href="/">
                <h1>🍿 CineMates</h1>
              </Link>
              {authProps.authed && <ProfileMenu {...authProps} />}
            </Paper>
            {children}
          </div>
          <Box
            component="footer"
            sx={{
              textAlign: 'center',
              py: 3,
              mt: 8,
              borderTop: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              © {new Date().getFullYear()} <strong>lensesrequired</strong>. All
              rights reserved.
            </Typography>

            <Stack direction="row" spacing={3} justifyContent="center">
              <MLink
                href="https://github.com/lensesrequired"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="inherit"
              >
                GitHub
              </MLink>
              <MLink
                href="mailto:admin@lensesrequired.com"
                underline="hover"
                color="inherit"
              >
                Contact
              </MLink>
            </Stack>
          </Box>
        </body>
      </Providers>
    </html>
  );
}

export default RootLayout;
