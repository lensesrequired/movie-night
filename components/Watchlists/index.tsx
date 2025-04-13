'use client';

import { CreateWatchlistModal } from '@/components/Watchlists/CreateModal';
import { WatchlistGrid } from '@/components/Watchlists/Grid';
import { apiFetch } from '@/helpers/fetch';
import { Watchlist } from '@/types';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';

export const Watchlists = () => {
  const [isLoading, setIsLoading] = useState(true);
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
        // TODO: handle error
        // setError(error || 'Something went wrong. Please try again.');
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
