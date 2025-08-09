import { PosterDisplay } from '@/components/movie/PosterDisplay';
import { usePickContext } from '@/components/pick/Context';
import { FormPage } from '@/components/pick/modal/index';
import { apiFetch } from '@/helpers/fetch';
import { WatchlistMovie } from '@/types';
import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
} from '@mui/material';

type SubmittedVotesProps = {
  onClose: () => void;
  watchlistId: string;
  movies: WatchlistMovie[];
  setFormPage: (page: FormPage) => void;
};

export const SubmittedVotes = ({
  onClose,
  watchlistId,
  movies,
  setFormPage,
}: SubmittedVotesProps) => {
  const { existingPick, votes } = usePickContext();
  console.log(votes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const voteMovies = useMemo(
    () => votes?.map((movieId) => movies.find((m) => movieId === m.tmdbId)),
    [movies, votes],
  );

  const onSubmit = async () => {
    setIsLoading(true);
    //TODO: switch to vote counting
    apiFetch(`/api/watchlist/${watchlistId}/pick/${existingPick?.name}/vote`, {
      method: 'POST',
      body: JSON.stringify({}),
    }).then(({ ok, data, error }) => {
      if (ok && data.success) {
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
          You have submitted your vote!
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {voteMovies?.map((movie, i) => {
              if (movie) {
                return (
                  <Box
                    key={`vote-movie-${i}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <PosterDisplay
                      src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
                      altTitle={`${movie.title} Poster`}
                    />
                    <h3>
                      {movie.title}
                      {movie.releaseDate &&
                        ` (${new Date(movie.releaseDate).toLocaleDateString()})`}
                    </h3>
                  </Box>
                );
              }
            })}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onSubmit} loading={isLoading}>
          Count the Votes!
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setFormPage(FormPage.VOTE);
          }}
          loading={isLoading}
        >
          Change my Vote
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
};
