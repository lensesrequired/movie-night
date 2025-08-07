import { usePickContext } from '@/components/pick/Context';
import { FormPage } from '@/components/pick/modal/index';
import {
  DurationOption,
  MoviePoolOption,
  PickOption,
  pickOptions,
} from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { WatchlistMovie } from '@/types';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

type CreateFormProps = {
  onClose: () => void;
  watchlistId: string;
  retrievePicks: (pickName?: string) => void;
  setPickedMovie: (movie: WatchlistMovie) => void;
  setFormPage: (page: FormPage) => void;
};

export const CreateForm = ({
  onClose,
  watchlistId,
  retrievePicks,
  setPickedMovie,
  setFormPage,
}: CreateFormProps) => {
  const {
    pickName,
    pickType,
    expiryOptions,
    setPickName,
    setPickType,
    setExpiryOptions,
    moviePool,
  } = usePickContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>('');

  useEffect(() => {
    if (
      pickType === PickOption.RANDOM_SELECTION &&
      moviePool === MoviePoolOption.ALL_MOVIES
    ) {
      setButtonText('Show Me A Flick');
    } else if (moviePool === MoviePoolOption.ALL_MOVIES) {
      setButtonText('Save Pick & Start Voting');
    } else {
      setButtonText('Select Movies');
    }
  }, [moviePool, pickType]);

  useEffect(() => {
    setDisabled(!pickName);
  }, [pickName]);

  const onSubmit = async () => {
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
          retrievePicks(pickName);
          setFormPage(FormPage.VOTE);
        } else if (error) {
          setError(error);
        }
        setIsLoading(false);
      });
    }
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
          Enter a name for your Pick and choose a selection type.
          {/*TODO: verify not in list already*/}
          <TextField
            id="name"
            label="Pick Name"
            variant="outlined"
            value={pickName}
            required
            onChange={(e) => setPickName(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel id="selection-method-select-label">
              Selection Method
            </InputLabel>
            <Select
              labelId="selection-method-select-label"
              id="selection-method-select"
              value={pickType}
              label="Selection Method"
              onChange={(e) => {
                setPickType(e.target.value as PickOption);
              }}
            >
              {pickOptions.map(({ text, value }) => (
                <MenuItem key={`${value}-option`} value={value}>
                  {text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {[PickOption.VOTING_STANDARD, PickOption.VOTING_RANKED].includes(
            pickType,
          ) && (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              Allow voting for...&nbsp;
              <Select
                id="voting-duration-number-select"
                value={expiryOptions.count}
                onChange={(e) => {
                  setExpiryOptions({
                    count: e.target.value as number,
                    type: expiryOptions.type,
                  });
                }}
              >
                {Array(expiryOptions.type === DurationOption.WEEK ? 2 : 7)
                  .fill(null)
                  .map((_, i) => (
                    <MenuItem
                      key={`voting-duration-number-option-${i}`}
                      value={i + 1}
                    >
                      {i + 1}
                    </MenuItem>
                  ))}
              </Select>
              <Select
                id="voting-duration-unit-select"
                value={expiryOptions.type}
                onChange={(e) => {
                  setExpiryOptions({
                    count: expiryOptions.count,
                    type: e.target.value as DurationOption,
                  });
                }}
              >
                <MenuItem value={DurationOption.DAY}>Day(s)</MenuItem>
                <MenuItem value={DurationOption.WEEK}>Week(s)</MenuItem>
              </Select>
            </Box>
          )}
          {/*<FormControl>*/}
          {/*  <FormLabel id="movie-list-type-group-label">Movie Pool</FormLabel>*/}
          {/*  If you choose to Pick a Flick based off of only Selected Movies, you*/}
          {/*  will be able to select those movies on the next screen.*/}
          {/*  <RadioGroup*/}
          {/*    aria-labelledby="movie-list-type-group-label"*/}
          {/*    name="movie-list-type-group"*/}
          {/*    value={moviePool}*/}
          {/*    onChange={(e) => {*/}
          {/*      setMoviePool(e.target.value as MoviePoolOption);*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <FormControlLabel*/}
          {/*      value={MoviePoolOption.ALL_MOVIES}*/}
          {/*      control={<Radio />}*/}
          {/*      label="All Movies"*/}
          {/*    />*/}
          {/*    <FormControlLabel*/}
          {/*      value={MoviePoolOption.SELECTED_MOVIES}*/}
          {/*      control={<Radio />}*/}
          {/*      label="Selected Movies"*/}
          {/*    />*/}
          {/*  </RadioGroup>*/}
          {/*</FormControl>*/}
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
};
