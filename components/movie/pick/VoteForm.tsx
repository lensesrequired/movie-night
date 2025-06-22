import { usePickContext } from '@/components/movie/pick/Context';
import { PickOption } from '@/constants';
import { WatchlistMovie } from '@/types';
import { Autocomplete, TextField } from '@mui/material';

export type VoteFormProps = {
  movies: WatchlistMovie[];
};

export const VoteForm = ({ movies }: VoteFormProps) => {
  const {
    pickName,
    pickType,
    expiryOptions,
    setPickName,
    setPickType,
    setMoviePool,
    setExpiryOptions,
  } = usePickContext();

  return (
    <>
      {pickType === PickOption.VOTING_RANKED &&
        'Pick your top three choices (in order)'}
      <Autocomplete
        id="first-choice"
        disableClearable
        options={movies.map(({ title }) => title)}
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
            disableClearable
            options={movies.map(({ title }) => title)}
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
            disableClearable
            options={movies.map(({ title }) => title)}
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
