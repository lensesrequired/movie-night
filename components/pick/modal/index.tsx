import { usePickContext } from '@/components/pick/Context';
import { CreateForm } from '@/components/pick/modal/CreateForm';
import { PickedMovie } from '@/components/pick/modal/PickedMovie';
import { VoteForm } from '@/components/pick/modal/VoteForm';
import { PickOption } from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { WatchlistMovie } from '@/types';
import { useEffect, useState } from 'react';
import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';

export enum FormPage {
  INITIAL,
  MOVIE_SELECTION,
  VOTE,
  SUBMITTED_VOTES,
}

type PickModalProps = {
  onClose: () => void;
  watchlistId: string;
  reloadMovies: () => void;
  retrievePicks: (pickName?: string) => void;
  movies: WatchlistMovie[];
};

export const Modal = ({ onClose, watchlistId, ...props }: PickModalProps) => {
  const {
    pickedMovie: alreadyPickedMovie,
    existingPick,
    votes,
    setVotes,
  } = usePickContext();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pickedMovie, setPickedMovie] = useState<WatchlistMovie | null>(
    alreadyPickedMovie || null,
  );
  const [formPage, setFormPage] = useState<FormPage>(
    existingPick && existingPick.pickType !== PickOption.RANDOM_SELECTION
      ? FormPage.VOTE
      : FormPage.INITIAL,
  );

  useEffect(() => {
    if (existingPick && votes === undefined) {
      setIsLoading(true);
      apiFetch(
        `/api/watchlist/${watchlistId}/pick/${encodeURIComponent(existingPick.name)}/vote`,
      ).then(({ ok, data, error }) => {
        if (ok && data.votes) {
          setVotes(data.votes);
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
        setIsLoading(false);
      });
    }
  }, [existingPick, setVotes, votes, watchlistId]);

  const renderContent = () => {
    if (isLoading) {
      return <DialogContent>Loading...</DialogContent>;
    }
    if (error) {
      return (
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
      );
    }
    if (pickedMovie) {
      return (
        <PickedMovie
          {...props}
          pickedMovie={pickedMovie}
          onClose={onClose}
          watchlistId={watchlistId}
        />
      );
    }
    if (formPage === FormPage.VOTE) {
      return (
        <VoteForm
          {...props}
          onClose={onClose}
          watchlistId={watchlistId}
          setFormPage={setFormPage}
        />
      );
    }
    return (
      <CreateForm
        {...props}
        onClose={onClose}
        watchlistId={watchlistId}
        setPickedMovie={setPickedMovie}
        setFormPage={setFormPage}
      />
    );
  };

  return (
    <Dialog open onClose={onClose} aria-labelledby="pick-movie-dialog-title">
      <DialogTitle id="pick-movie-dialog-title">Pick a Flick</DialogTitle>
      {renderContent()}
    </Dialog>
  );
};
