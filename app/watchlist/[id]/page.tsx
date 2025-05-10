import { WatchlistDetails } from '@/components/watchlist/Details';
import withAuth from '@/components/withAuth';
import { AuthProps } from '@/types';

async function WatchlistPage({
  params,
  username,
}: { params: Promise<{ id: string }> } & AuthProps) {
  const { id } = await params;

  return <WatchlistDetails id={id} username={username} />;
}

export default withAuth(WatchlistPage);
