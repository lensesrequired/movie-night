'use client';

import { MovieModal } from '@/components/movie/Modal';
import { apiFetch } from '@/helpers/fetch';
import { Watchlist } from '@/types';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Box, Button, Skeleton } from '@mui/material';
import { WatchlistModal } from './Modal';

type WatchlistDetailsProps = { id: string; email: string };

export function WatchlistDetails({ id, email }: WatchlistDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [watchlist, setWatchlist] = useState<Watchlist>();
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showMovieModal, setShowMovieModal] = useState<boolean>(false);

  const retrieveWatchlist = () => {
    setIsLoading(true);
    apiFetch(`/api/watchlist/${id}`).then(({ ok, data, error }) => {
      if (ok && data.watchlist) {
        setWatchlist(data.watchlist);
      } else {
        console.log(error);
        setError(error || 'Something went wrong. Please try again.');
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    retrieveWatchlist();
  }, []);

  return (
    <>
      {showEditModal && (
        <WatchlistModal
          onClose={() => {
            setShowEditModal(false);
          }}
          onSuccess={retrieveWatchlist}
          defaults={watchlist}
        />
      )}
      {showMovieModal && (
        <MovieModal
          onClose={() => {
            setShowMovieModal(false);
          }}
          onSuccess={retrieveWatchlist}
        />
      )}
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
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'row' }}>
                {watchlist.manager === email && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setShowEditModal(true);
                    }}
                  >
                    Edit Watchlist
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setShowMovieModal(true);
                  }}
                >
                  Add Movie
                </Button>
              </Box>
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
    </>
  );
}
