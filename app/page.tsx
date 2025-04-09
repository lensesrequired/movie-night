import { Auth } from '@/components/Auth';
import { Lists } from '@/components/Lists';
import withAuth, { AuthPageProps } from '@/components/withAuth';

async function Home({ authed }: AuthPageProps) {
  if (authed) {
    return <Lists />;
  }
  return <Auth />;
}

export default withAuth(Home);
