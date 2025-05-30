import { usePickContext } from '@/components/movie/pick/Context';
import { MoviePoolOption, PickOption, pickOptions } from '@/constants';
import {
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
    setPickName,
    setPickType,
    setMoviePool,
  } = usePickContext();

  return (
    <>
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
        If you choose to Pick a Movie based off only Selected Movies, you will
        be able to select those movies with the members of this wishlist or by
        yourself on the next screen.
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
