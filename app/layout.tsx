import { Providers } from '@/app/providers';
import { ProfileMenu } from '@/components/ProfileMenu';
import { getAuth } from '@/components/withAuth';
import type { Metadata } from 'next';
import { Spectral } from 'next/font/google';
import Link from 'next/link';
import { ReactNode } from 'react';
import Paper from '@mui/material/Paper';
import './globals.scss';

const spectral = Spectral({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Movie Night',
  description: 'For watchlists with friends!',
};

async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const authProps = await getAuth();

  return (
    <html lang="en">
      <body className={`${spectral.className}`}>
        <Providers>
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
              <h1>🍿 Movie Night</h1>
            </Link>
            {authProps.authed && <ProfileMenu {...authProps} />}
          </Paper>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
