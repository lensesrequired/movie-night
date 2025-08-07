import { usePickContext } from '@/components/movie/pick/Context';
import { PickOption } from '@/constants';
import { WatchlistMovie } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

export type VoteFormProps = {
  movies: WatchlistMovie[];
  setDisabled: (value: boolean) => void;
};

export const VoteForm = ({ movies, setDisabled }: VoteFormProps) => {
  const { pickType } = usePickContext();
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
  }, [availableMovies.length, pickType, setDisabled, votes]);

  return (
    <>
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
    </>
  );
};
