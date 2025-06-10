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

export const VoteForm = () => {
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

  return <>VOTE</>;
};
