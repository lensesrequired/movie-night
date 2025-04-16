import { Watchlist } from '@/types';
import { Box, Button, Grid, Paper, Skeleton } from '@mui/material';

type WatchlistGridProps = {
  isLoading?: boolean;
  watchlists: Watchlist[];
};

export const WatchlistGrid = ({
  isLoading,
  watchlists,
}: WatchlistGridProps) => {
  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Grid id="watchlist-grid" container spacing={2}>
        {(isLoading ? Array(6).fill(null) : watchlists).map(
          (watchlist, index) => (
            <Grid key={`watchlist-${watchlist?.id || index}`}>
              {watchlist ? (
                <Button href={`/watchlist/${watchlist.id}`}>
                  <Box sx={{ width: '130px', textAlign: 'center' }}>
                    <Paper
                      elevation={24}
                      sx={{ width: '130px', height: '180px', mb: 1 }}
                    >
                      <Box sx={{ p: 2 }}>Title Artwork</Box>
                    </Paper>
                    {watchlist.title}
                  </Box>
                </Button>
              ) : (
                <Box sx={{ p: 1 }}>
                  <Skeleton variant="rounded" width={130} height={180} />
                  <Skeleton />
                </Box>
              )}
            </Grid>
          ),
        )}
      </Grid>
    </Box>
  );
};
