import { MoviePoolOption, PickOption, pickOptions } from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@mui/material';

export type PickMovieModalProps = {
  onClose: () => void;
  watchlistId: string;
  defaultChoice: PickOption;
};

export const PickMovieModal = ({
  onClose,
  watchlistId,
  defaultChoice,
}: PickMovieModalProps) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pickName, setPickName] = useState<string>('');
  const [pickType, setPickType] = useState<PickOption>(defaultChoice);
  const [moviePool, setMoviePool] = useState<MoviePoolOption>(
    MoviePoolOption.ALL_MOVIES,
  );
  const [buttonText, setButtonText] = useState<string>('Next');

  useEffect(() => {
    if (
      pickType === PickOption.RANDOM_SELECTION &&
      moviePool === MoviePoolOption.ALL_MOVIES
    ) {
      setButtonText('Show Me A Flick');
    } else {
      setButtonText('Next');
    }
  }, [moviePool, pickType]);

  const onSubmit = async () => {
    if (
      pickType === PickOption.RANDOM_SELECTION &&
      moviePool === MoviePoolOption.ALL_MOVIES
    ) {
      apiFetch(
        `/api/watchlist/${watchlistId}/pick/random?pool=${moviePool}`,
      ).then(({ ok, data, error }) => {
        if (ok && data.movie) {
          console.log(data.movie);
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
      });
    } else {
      // next screen
    }
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
          <FormControl>
            <FormLabel id="movie-list-type-group-label">Movie Pool</FormLabel>
            If you choose to Pick a Movie based off only Selected Movies, you
            will be able to select those movies with the members of this
            wishlist or by yourself on the next screen.
            <RadioGroup
              aria-labelledby="movie-list-type-group-label"
              name="movie-list-type-group"
              value={moviePool}
              onChange={(e) => {
                setMoviePool(e.target.value as MoviePoolOption);
              }}
            >
              <FormControlLabel
                value={MoviePoolOption.ALL_MOVIES}
                control={<Radio />}
                label="All Movies"
              />
              <FormControlLabel
                value={MoviePoolOption.SELECTED_MOVIES}
                control={<Radio />}
                label="Selected Movies"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={onSubmit}
          loading={isLoading}
          disabled={!pickName}
        >
          {buttonText}
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
