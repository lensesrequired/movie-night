import { apiFetch } from '@/helpers/fetch';
import { TMDBMovieLookup } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
} from '@mui/material';

export type MovieModalProps = {
  watchlistId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export const MovieModal = ({
  watchlistId,
  onClose,
  onSuccess,
}: MovieModalProps) => {
  const [search, setSearch] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<TMDBMovieLookup[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const onSearch = () => {
    // TODO: add year to query
    const params = new URLSearchParams();
    params.set('search', search);
    if (year) {
      params.set('year', year);
    }
    apiFetch(`/api/movie?${params.toString()}`).then(({ ok, data, error }) => {
      if (ok && data) {
        setError('');
        const { results } = data;
        setResults(results);
        if (results.length === 0) {
          setError(
            'There are no results for that search. Please try a different title.',
          );
        }
      } else {
        setError(error || 'Something went wrong. Please try again.');
        setResults([]);
      }
    });
  };

  const onAddMovie = async () => {
    if (selected || selected === 0) {
      apiFetch(`/api/watchlist/${watchlistId}/movie`, {
        method: 'put',
        body: JSON.stringify(results[selected]),
      }).then(({ ok, data, error }) => {
        if (ok && data.success) {
          onSuccess();
          onClose();
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
      });
    } else {
      setError('No movie selected.');
    }
  };

  return (
    <Dialog open onClose={onClose} aria-labelledby="search-dialog-title">
      <DialogTitle id="search-dialog-title">Movie Search</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            pt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: '40vw', // TODO: mobile styles
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            id="search"
            label="Search by Title"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            required
          />
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <TextField
              id="year"
              label="Release Year"
              variant="outlined"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={onSearch}
              disabled={!search}
              autoFocus
            >
              Search
            </Button>
          </Box>
        </Box>
        {Boolean(results.length) && (
          <Box sx={{ my: 2 }}>
            {results.map(
              ({ id, title, releaseDate, overview, posterPath }, i) => (
                <Box
                  key={id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    my: 1,
                    pt: 2,
                    pb: 1,
                    px: 2,
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: 'transparent',
                    '&:hover,&.selected': { backgroundColor: 'action.focus' },
                    '&.selected': {
                      borderColor: 'action.selected',
                    },
                  }}
                  className={(selected === i && 'selected') || ''}
                  onClick={() => {
                    setSelected(selected === i ? null : i);
                  }}
                >
                  <Paper
                    elevation={6}
                    sx={{ width: '130px', height: '180px', mb: 1, mr: 2 }}
                  >
                    {posterPath && (
                      <Image
                        width={130}
                        height={180}
                        src={`https://image.tmdb.org/t/p/w500/${posterPath}`}
                        alt={`${title} poster image`}
                      />
                    )}
                  </Paper>
                  <div>
                    <h3>{title}</h3>
                    <Box>
                      {releaseDate &&
                        new Date(releaseDate).toLocaleDateString()}
                    </Box>
                    <Box color="text.secondary">{overview}</Box>
                  </div>
                </Box>
              ),
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="outlined"
          onClick={onAddMovie}
          disabled={selected === null}
        >
          Add Movie
        </Button>
      </DialogActions>
    </Dialog>
  );
};
