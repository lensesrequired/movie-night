import { WatchlistDetails } from '@/components/watchlist/Details';
import withAuth from '@/components/withAuth';
import { AuthProps } from '@/types';

async function WatchlistPage({
  params,
  searchParams,
  username,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
} & AuthProps) {
  const { id } = await params;
  const { code } = await searchParams;

  return <WatchlistDetails id={id} username={username} inviteCode={code} />;
}

export default withAuth(WatchlistPage);
