import { Providers } from '@/app/providers';
import withAuth, { AuthPageProps } from '@/components/withAuth';
import type { Metadata } from 'next';
import { Spectral } from 'next/font/google';
import Link from 'next/link';
import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import './globals.scss';

const spectral = Spectral({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Movie Night',
  description: 'For watchlists with friends!',
};

async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }> & AuthPageProps) {
  return (
    <html lang="en">
      <body className={`${spectral.className}`}>
        <Providers>
          <Box sx={{ m: 2, display: 'flex' }}>
            <Link href="/">
              <h1>🍿 Movie Night</h1>
            </Link>
          </Box>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export default withAuth(RootLayout);
