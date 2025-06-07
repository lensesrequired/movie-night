import { usePickContext } from '@/components/movie/pick/Context';
import {
  DurationOption,
  MoviePoolOption,
  PickOption,
  pickOptions,
} from '@/constants';
import {
  Box,
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

export const InitialForm = () => {
  const {
    pickName,
    pickType,
    moviePool,
    expiryOptions,
    setPickName,
    setPickType,
    setMoviePool,
    setExpiryOptions,
  } = usePickContext();

  return (
    <>
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
      <FormControl>
        <FormLabel id="movie-list-type-group-label">Movie Pool</FormLabel>
        If you choose to Pick a Flick based off of only Selected Movies, you
        will be able to select those movies on the next screen.
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
    </>
  );
};
