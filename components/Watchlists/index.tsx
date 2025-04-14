'use client';

import { CreateWatchlistModal } from '@/components/Watchlists/CreateModal';
import { WatchlistGrid } from '@/components/Watchlists/Grid';
import { apiFetch } from '@/helpers/fetch';
import { Watchlist } from '@/types';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button } from '@mui/material';

export const Watchlists = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  useEffect(() => {
    apiFetch('/api/watchlists').then(({ ok, data, error }) => {
      if (ok && data.watchlists) {
        setWatchlists(data.watchlists);
      } else {
        setError(error || 'Something went wrong. Please try again.');
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      {showCreateModal && (
        <CreateWatchlistModal
          onClose={() => {
            setShowCreateModal(false);
          }}
        />
      )}
      <Box sx={{ m: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1>Your Watchlists</h1>
          {Boolean(watchlists.length) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateModal}
            >
              Create Watchlist
            </Button>
          )}
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <WatchlistGrid isLoading={isLoading} watchlists={watchlists} />
      </Box>
      {!watchlists.length && !isLoading && (
        <Box
          sx={{
            height: '40vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'stretch',
            gap: '1rem',
          }}
        >
          <h2>Nothing to see here! Create a Watchlist to get started!</h2>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            Start Listin'
          </Button>
        </Box>
      )}
    </>
  );
};
