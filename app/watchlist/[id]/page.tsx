import { WatchlistDetails } from '@/components/Watchlist';
import withAuth from '@/components/withAuth';

async function WatchlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <WatchlistDetails id={id} />;
}

export default withAuth(WatchlistPage);
