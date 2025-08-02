import { PosterDisplay } from '@/components/movie/PosterDisplay';
import { usePickContext } from '@/components/movie/pick/Context';
import { InitialForm } from '@/components/movie/pick/InitialForm';
import { SaveDropdown } from '@/components/movie/pick/SaveDropdown';
import { VoteForm } from '@/components/movie/pick/VoteForm';
import { MoviePoolOption, PickOption } from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { WatchlistMovie } from '@/types';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

enum FormPage {
  INITIAL,
  MOVIE_SELECTION,
  VOTE,
}

export type PickModalProps = {
  onClose: () => void;
  watchlistId: string;
  reloadMovies: () => void;
  retrievePicks: () => void;
  movies: WatchlistMovie[];
};

export const Modal = ({
  onClose,
  watchlistId,
  reloadMovies,
  retrievePicks,
  movies,
}: PickModalProps) => {
  const {
    pickName,
    pickType,
    moviePool,
    expiryOptions,
    pickedMovie: alreadyPickedMovie,
    existingPick,
  } = usePickContext();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pickedMovie, setPickedMovie] = useState<WatchlistMovie | null>(
    alreadyPickedMovie || null,
  );
  const [buttonText, setButtonText] = useState<string>('Next');
  const [formPage, setFormPage] = useState<FormPage>(
    existingPick ? FormPage.VOTE : FormPage.INITIAL,
  );
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (pickedMovie) {
      setButtonText(alreadyPickedMovie ? '' : 'Show Me A(nother) Flick');
    } else if (
      pickType === PickOption.RANDOM_SELECTION &&
      moviePool === MoviePoolOption.ALL_MOVIES
    ) {
      setButtonText('Show Me A Flick');
    } else if (formPage === FormPage.VOTE) {
      setButtonText('Submit Votes');
    } else if (moviePool === MoviePoolOption.ALL_MOVIES) {
      setButtonText('Save Pick & Start Voting');
    } else {
      setButtonText('Select Movies');
    }
  }, [alreadyPickedMovie, formPage, moviePool, pickType, pickedMovie]);

  const onSubmit = async () => {
    if (formPage === FormPage.INITIAL) {
      if (
        pickType === PickOption.RANDOM_SELECTION &&
        moviePool === MoviePoolOption.ALL_MOVIES
      ) {
        setIsLoading(true);
        apiFetch(
          `/api/watchlist/${watchlistId}/pick/random?pool=${moviePool}`,
        ).then(({ ok, data, error }) => {
          if (ok && data.movie) {
            setPickedMovie(data.movie);
          } else {
            setError(error || 'Something went wrong. Please try again.');
          }
          setIsLoading(false);
        });
      } else if (moviePool === MoviePoolOption.ALL_MOVIES) {
        setIsLoading(true);
        apiFetch(`/api/watchlist/${watchlistId}/pick`, {
          method: 'PUT',
          body: JSON.stringify({
            name: pickName,
            pickType,
            moviePool,
            expiryOptions,
          }),
        }).then(({ ok, data, error }) => {
          if (ok && data.success) {
            retrievePicks();
            setFormPage(FormPage.VOTE);
          } else if (error) {
            setError(error);
          }
          setIsLoading(false);
        });
      }
    } else if (formPage === FormPage.VOTE) {
    } else {
      // select movies screen
    }
  };

  useEffect(() => {
    setDisabled(!pickName);
  }, [pickName]);

  const renderForm = () => {
    if (formPage === FormPage.VOTE) {
      return <VoteForm movies={movies} setDisabled={setDisabled} />;
    }
    return <InitialForm />;
  };

  return (
    <Dialog open onClose={onClose} aria-labelledby="pick-movie-dialog-title">
      <DialogTitle id="pick-movie-dialog-title">Pick a Flick</DialogTitle>
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
          {pickedMovie ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              Here&#39;s your selected flick! You can save it for later or
              remove the movie from the list. If you save it for later, it will
              be viewable for 1 week before the pick will expire.
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
          ) : (
            renderForm()
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {buttonText && (
          <Button
            variant="contained"
            onClick={onSubmit}
            loading={isLoading}
            disabled={disabled}
          >
            {buttonText}
          </Button>
        )}
        {pickedMovie ? (
          <SaveDropdown
            closeModal={onClose}
            watchlistId={watchlistId}
            movieId={pickedMovie.tmdbId}
            setError={setError}
            reloadMovies={reloadMovies}
            retrievePicks={retrievePicks}
          />
        ) : (
          <Button onClick={onClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
