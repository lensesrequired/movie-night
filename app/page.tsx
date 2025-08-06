import { Auth } from '@/components/Auth';
import { Watchlists } from '@/components/watchlist';
import withAuth from '@/components/withAuth';
import { AuthProps } from '@/types';

async function Home({ authed }: AuthProps) {
  if (authed) {
    return <Watchlists />;
  }
  return <Auth />;
}

console.log(withAuth(Home, true));

export default withAuth(Home, true);
