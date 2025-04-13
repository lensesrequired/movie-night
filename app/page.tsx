import { Auth } from '@/components/Auth';
import { Watchlists } from '@/components/Watchlists';
import withAuth from '@/components/withAuth';
import { AuthProps } from '@/types';

async function Home({ authed }: AuthProps) {
  if (authed) {
    return <Watchlists />;
  }
  return <Auth />;
}

export default withAuth(Home, true);
