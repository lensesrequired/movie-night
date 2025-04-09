import { Providers } from '@/app/providers';
import { ProfileMenu } from '@/components/ProfileMenu';
import { getAuth } from '@/components/withAuth';
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

async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const authProps = await getAuth();

  return (
    <html lang="en">
      <body className={`${spectral.className}`}>
        <Providers>
          <Box
            sx={{
              p: 2,
              pb: 1,
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #fff',
              background: '#000',
            }}
          >
            <Link href="/">
              <h1>🍿 Movie Night</h1>
            </Link>
            {authProps.authed && <ProfileMenu {...authProps} />}
          </Box>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
