import { Auth } from '@/components/auth';
import withAuth, { AuthPageProps } from '@/components/withAuth';

async function Home({ authed }: AuthPageProps) {
  if (authed) {
    return 'Profile';
  }
  return <Auth />;
}

export default withAuth(Home);
