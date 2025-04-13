import { AuthProps } from '@/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { JSX } from 'react';

export const getAuth = async (): Promise<AuthProps> => {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth');

  return await fetch('http://localhost:3000/api/authenticate', {
    method: 'get',
    headers: {
      Cookie: `auth=${authCookie?.value || ''}`,
    },
  })
    .then((resp) => resp.json())
    .then((data) => data);
};

export default function withAuth(
  Component: JSX.ElementType,
  noRedirect?: boolean,
) {
  return async function WithAuth(props: Record<string, unknown>) {
    const auth = await getAuth();

    if (!noRedirect && !auth.authed) {
      redirect('/');
    }

    return <Component {...props} {...auth} />;
  };
}
