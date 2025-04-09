import { Auth } from '@/components/Auth';
import { Watchlists } from '@/components/Watchlists';
import withAuth, { AuthPageProps } from '@/components/withAuth';

async function Home({ authed }: AuthPageProps) {
  if (authed) {
    return <Watchlists />;
  }
  return <Auth />;
}

export default withAuth(Home);
