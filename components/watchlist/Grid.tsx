import { Watchlist } from '@/types';
import { useRouter } from 'next/navigation';
import { Box, Skeleton } from '@mui/material';

type WatchlistGridProps = {
  isLoading?: boolean;
  watchlists: Watchlist[];
};

export const WatchlistGrid = ({
  isLoading,
  watchlists,
}: WatchlistGridProps) => {
  const router = useRouter();
  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ my: 2 }}>
        {(isLoading ? Array(4).fill(null) : watchlists).map(
          (watchlist, index) => (
            <Box
              key={`watchlist-${watchlist?.id || index}`}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                my: 1,
              }}
              onClick={() => {
                if (watchlist) {
                  router.push(`/watchlist/${watchlist.id}`);
                }
              }}
            >
              {watchlist ? (
                <Box
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: 'transparent',
                    '&:hover': { backgroundColor: 'action.focus' },
                  }}
                >
                  <h2>{watchlist.title}</h2>
                  <h4>{watchlist.description}</h4>
                </Box>
              ) : (
                <Skeleton width="100%" height="6rem" />
              )}
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
};
