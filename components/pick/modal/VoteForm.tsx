import { usePickContext } from '@/components/pick/Context';
import { FormPage } from '@/components/pick/modal/index';
import { PickOption } from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { WatchlistMovie } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  DialogActions,
  DialogContent,
  TextField,
} from '@mui/material';

type VoteFormProps = {
  onClose: () => void;
  watchlistId: string;
  movies: WatchlistMovie[];
  setFormPage: (page: FormPage) => void;
};

export const VoteForm = ({
  onClose,
  watchlistId,
  movies,
  setFormPage,
}: VoteFormProps) => {
  const {
    pickType,
    existingPick,
    setVotes: setSubmittedVotes,
  } = usePickContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);
  const [votes, setVotes] = useState<string[]>(['', '', '']);

  const availableMovies = useMemo(
    () =>
      movies.filter((movie: WatchlistMovie) => !votes.includes(movie.title)),
    [movies, votes],
  );

  useEffect(() => {
    setDisabled(
      !availableMovies.length || pickType === PickOption.VOTING_RANKED
        ? votes.some((v) => !v)
        : !votes[0],
    );
  }, []);

  useEffect(() => {
    setDisabled(
      !availableMovies.length || pickType === PickOption.VOTING_RANKED
        ? votes.some((v) => !v)
        : !votes[0],
    );
  }, [availableMovies.length, pickType, setDisabled, votes]);

  const onSubmit = async () => {
    setIsLoading(true);
    apiFetch(`/api/watchlist/${watchlistId}/pick/${existingPick?.name}/vote`, {
      method: 'POST',
      body: JSON.stringify({ votes: [] }),
    }).then(({ ok, data, error }) => {
      if (ok && data.success) {
        setSubmittedVotes(votes.filter((v) => v));
        setFormPage(FormPage.SUBMITTED_VOTES);
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
          {pickType === PickOption.VOTING_RANKED
            ? 'Vote for your top three choices (in order)'
            : 'Vote for your top movie for this pick'}
          <Autocomplete
            id="first-choice"
            value={votes[0]}
            onChange={(_, newValue: string | null) => {
              const newVotes = [...votes] as string[];
              newVotes[0] = newValue || '';
              setVotes(newVotes);
            }}
            options={availableMovies.map(({ title }) => title)}
            renderInput={(params) => (
              <TextField
                {...params}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    type: 'search',
                  },
                }}
                label="First choice"
              />
            )}
          />
          {pickType === PickOption.VOTING_RANKED && (
            <>
              <Autocomplete
                id="second-choice"
                value={votes[1]}
                onChange={(_, newValue: string | null) => {
                  const newVotes = [...votes] as string[];
                  newVotes[1] = newValue || '';
                  setVotes(newVotes);
                }}
                options={availableMovies.map(({ title }) => title)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        type: 'search',
                      },
                    }}
                    label="Second choice"
                  />
                )}
              />
              <Autocomplete
                id="third-choice"
                value={votes[2]}
                onChange={(_, newValue: string | null) => {
                  const newVotes = [...votes] as string[];
                  newVotes[2] = newValue || '';
                  setVotes(newVotes);
                }}
                options={availableMovies.map(({ title }) => title)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        type: 'search',
                      },
                    }}
                    label="Third choice"
                  />
                )}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={onSubmit}
          loading={isLoading}
          disabled={disabled}
        >
          Submit Votes
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
};
