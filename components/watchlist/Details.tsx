'use client';

import { MovieModal } from '@/components/movie/Modal';
import { PickDropdown } from '@/components/pick/Dropdown';
import { InviteCodeModal } from '@/components/watchlist/InviteCodeModal';
import { MoviesGrid } from '@/components/watchlist/MoviesGrid';
import { apiFetch } from '@/helpers/fetch';
import { Watchlist, WatchlistMovie } from '@/types';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Alert, Box, Button, Skeleton } from '@mui/material';
import { WatchlistModal } from './Modal';

type WatchlistDetailsProps = {
  id: string;
  username: string;
  inviteCode?: string;
};

export function WatchlistDetails({
  id,
  username,
  inviteCode,
}: WatchlistDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [error, setError] = useState<string>('');
  const [watchlist, setWatchlist] = useState<Watchlist>();
  const [movies, setMovies] = useState<WatchlistMovie[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showInviteCodeModal, setShowInviteCodeModal] =
    useState<boolean>(false);

  const retrieveWatchlist = () => {
    setIsLoading(true);
    apiFetch(`/api/watchlist/${id}`).then(({ ok, data, error, status }) => {
      if (ok && data.watchlist) {
        setWatchlist(data.watchlist);
      } else if (status === 403) {
        window.location.assign(
          `join${inviteCode ? `?code=${encodeURIComponent(inviteCode)}` : ''}`,
        );
      } else {
        setError(error || 'Something went wrong. Please try again.');
      }
      setIsLoading(false);
    });
  };

  const retrieveMovies = () => {
    setIsLoadingMovies(true);
    apiFetch(`/api/watchlist/${id}/movies`).then(({ ok, data, error }) => {
      if (ok && data.movies) {
        setMovies(data.movies);
      } else {
        setError(error || 'Something went wrong. Please try again.');
      }
      setIsLoadingMovies(false);
    });
  };

  useEffect(() => {
    retrieveWatchlist();
    retrieveMovies();
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
      {showInviteCodeModal && (
        <InviteCodeModal
          watchlistId={id}
          onClose={() => {
            setShowInviteCodeModal(false);
          }}
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
                {watchlist.manager === username && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {(watchlist.manager === username || watchlist.allowInvites) && (
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => {
                      setShowInviteCodeModal(true);
                    }}
                  >
                    Invite
                  </Button>
                )}
                <PickDropdown
                  watchlistId={watchlist.id}
                  reloadMovies={retrieveMovies}
                  movies={movies}
                />
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
        <MoviesGrid
          isLoading={isLoadingMovies}
          watchlistId={id}
          movies={movies}
          reloadMovies={retrieveMovies}
          setError={setError}
        />
      </Box>
    </>
  );
}
