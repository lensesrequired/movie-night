import { Auth } from '@/components/Auth';
import { JoinForm } from '@/components/watchlist/JoinForm';
import withAuth from '@/components/withAuth';
import { AuthProps } from '@/types';

async function JoinWatchlistPage({
  username,
  searchParams,
}: {
  searchParams: Promise<{ code: string | undefined }>;
} & AuthProps) {
  const code = (await searchParams).code || '';

  if (username) {
    return <JoinForm defaultCode={code} />;
  }

  return <Auth redirectTo={`/watchlist/join?code=${code}`} />;
}

export default withAuth(JoinWatchlistPage, true);
