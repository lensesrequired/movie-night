'use client';

import { apiFetch } from '@/helpers/fetch';
import { Watchlist } from '@/types';
import { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Box, Button, Skeleton } from '@mui/material';

export function WatchlistDetails({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [watchlist, setWatchlist] = useState<Watchlist>();

  useEffect(() => {
    apiFetch(`/api/watchlist/${id}`).then(({ ok, data, error }) => {
      if (ok && data.watchlist) {
        setWatchlist(data.watchlist);
      } else {
        setError(error || 'Something went wrong. Please try again.');
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <Box sx={{ m: 3 }}>
      {watchlist ? (
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h1>{watchlist.title}</h1>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              // onClick={openCreateModal}
            >
              Edit Watchlist
            </Button>
          </Box>
          <Box color="text.secondary">
            <h4>{watchlist.description}</h4>
          </Box>
        </Box>
      ) : (
        isLoading && (
          <>
            <Skeleton width={300} height={'3.5rem'} />
            <Skeleton width="75%" />
          </>
        )
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
