import { cookies } from 'next/headers';
import { JSX } from 'react';

export type AuthPageProps = {
  authed: boolean;
  email: string;
  displayName: string;
};

export default function withAuth(Component: JSX.ElementType) {
  return async function WithAuth(props: Record<string, unknown>) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth');

    const auth = await fetch('http://localhost:3000/api/authenticate', {
      method: 'get',
      headers: {
        Cookie: `auth=${authCookie?.value || ''}`,
      },
    })
      .then((resp) => resp.json())
      .then((data) => data);

    return <Component {...props} {...auth} />;
  };
}
