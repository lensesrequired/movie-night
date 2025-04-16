import { WatchlistDetails } from '@/components/watchlist/Details';
import withAuth from '@/components/withAuth';
import { AuthProps } from '@/types';

async function WatchlistPage({
  params,
  email,
}: { params: Promise<{ id: string }> } & AuthProps) {
  const { id } = await params;

  return <WatchlistDetails id={id} email={email} />;
}

export default withAuth(WatchlistPage);
