'use client';

import { CreateWatchlistModal } from '@/components/Watchlists/CreateModal';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';

export const Watchlists = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  return (
    <Box
      sx={{
        height: '75vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'stretch',
        gap: '1rem',
      }}
    >
      {showCreateModal && (
        <CreateWatchlistModal
          onClose={() => {
            setShowCreateModal(false);
          }}
        />
      )}
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
  );
};
