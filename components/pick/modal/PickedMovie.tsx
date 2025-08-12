import { PosterDisplay } from '@/components/movie/PosterDisplay';
import { usePickContext } from '@/components/pick/Context';
import { SaveDropdown } from '@/components/pick/SaveDropdown';
import { PickOperation, PickOption } from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { WatchlistMovie } from '@/types';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
} from '@mui/material';

type PickedMovieProps = {
  onClose: () => void;
  watchlistId: string;
  reloadMovies: () => void;
  retrievePicks: (pickName?: string) => void;
  pickedMovie: WatchlistMovie;
};

export const PickedMovie = ({
  onClose,
  watchlistId,
  reloadMovies,
  retrievePicks,
  pickedMovie,
}: PickedMovieProps) => {
  const { pickType, pickName } = usePickContext();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    setIsLoading(true);
    apiFetch(
      `/api/watchlist/${watchlistId}/pick/${encodeURIComponent(pickName)}?operation=${PickOperation.REOPEN_VOTING}`,
      {
        method: 'POST',
      },
    ).then(({ ok, error }) => {
      if (ok) {
        retrievePicks(pickName);
      } else {
        setError(error || 'Something went wrong. Please try again.');
      }
      setIsLoading(false);
    });
  };

  return (
    <>
      <DialogContent>
        <Box
          sx={{
            pt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            Here&#39;s your selected flick! You can save it for later or remove
            the movie from the list. If you save it for later, it will be
            viewable for 1 week before the pick will expire.
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <PosterDisplay
                src={`https://image.tmdb.org/t/p/w500/${pickedMovie.posterPath}`}
                altTitle={`${pickedMovie.title} Poster`}
              />
              <h3>
                {pickedMovie.title}
                {pickedMovie.releaseDate &&
                  ` (${new Date(pickedMovie.releaseDate).toLocaleDateString()})`}
              </h3>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        {pickType !== PickOption.RANDOM_SELECTION && (
          <Button variant="outlined" onClick={onSubmit} loading={isLoading}>
            Reopen Voting
          </Button>
        )}
        <SaveDropdown
          closeModal={onClose}
          watchlistId={watchlistId}
          movieId={pickedMovie.tmdbId}
          setError={setError}
          reloadMovies={reloadMovies}
          retrievePicks={retrievePicks}
        />
      </DialogActions>
    </>
  );
};
