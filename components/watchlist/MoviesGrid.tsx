import { apiFetch } from '@/helpers/fetch';
import { WatchlistMovie } from '@/types';
import Image from 'next/image';
import { MouseEvent, useState } from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Button, Grid, Link, Paper, Skeleton } from '@mui/material';

type MoviesGridProps = {
  isLoading?: boolean;
  watchlistId: string;
  movies: WatchlistMovie[];
  reloadMovies: () => void;
  setError: (error: string) => void;
};

export const MoviesGrid = ({
  isLoading,
  watchlistId,
  movies,
  reloadMovies,
  setError,
}: MoviesGridProps) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const onMovieClick = (e: MouseEvent, index: number) => {
    if ((e.target as Element).tagName.toLowerCase() !== 'a') {
      if (selected.includes(index)) {
        setSelected(selected.filter((i) => i !== index));
      } else {
        setSelected([...selected, index]);
      }
    }
  };

  const onSelect = () => {
    setSelected(selected.length ? [] : movies.map((_, i) => i));
  };

  const onRemove = () => {
    setIsDeleting(true);
    apiFetch(`/api/watchlist/${watchlistId}/movies/delete`, {
      method: 'POST',
      body: JSON.stringify({ movies: selected.map((i) => movies[i].tmdbId) }),
    }).then(({ ok, data, error }) => {
      if (ok && data.success) {
        reloadMovies();
        setSelected([]);
      } else if (error) {
        setError(error);
      }
      setIsDeleting(false);
    });
  };

  return (
    <Box sx={{ pt: 3, width: '100%' }}>
      {isLoading ? (
        <Skeleton width="50%" height="2.5rem" />
      ) : (
        <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
          <Button variant="contained">Start a Poll</Button>
          <Button variant="outlined" onClick={onSelect}>
            {selected.length ? 'Unselect All' : 'Select All'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={selected.length === 0 || isDeleting}
            onClick={onRemove}
          >
            Remove Movies
          </Button>
        </Box>
      )}
      <Grid id="movie-grid" container spacing={2} mt={1}>
        {(isLoading ? Array(6).fill(null) : movies).map((movie, index) => (
          <Grid key={`watchlist-${movie?.tmdbId || index}`}>
            {movie ? (
              <Button
                onClick={(e) => {
                  onMovieClick(e, index);
                }}
                sx={{
                  '& .movie-title': {
                    zIndex: '1000',
                  },
                  '& .select-box': {
                    width: '100%',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                  },
                  '.unselected': {
                    display: 'none',
                  },
                  '&:hover': {
                    '.overlay': {
                      backgroundColor: 'grey.700',
                      opacity: 0.66,
                      borderRadius: '3px',
                    },
                    '.unselected': {
                      display: 'inline',
                      mt: 0.25,
                      ml: 0.25,
                    },
                  },
                }}
                className={selected.includes(index) ? 'selected' : ''}
              >
                <Box
                  sx={{
                    width: '150px',
                    textAlign: 'center',
                    textTransform: 'initial',
                  }}
                >
                  <Paper
                    className="overlay"
                    elevation={24}
                    sx={{ width: '150px', height: '225px', mb: 1 }}
                  >
                    <Image
                      width={150}
                      height={225}
                      src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
                      alt={`${movie.title} poster image`}
                    />
                  </Paper>
                  <Box
                    sx={{
                      display: 'absolute',
                      textAlign: 'left',
                      pt: 1.5,
                      pl: 1.75,
                    }}
                    className="select-box"
                  >
                    {selected.includes(index) ? (
                      <CheckBoxIcon
                        color="secondary"
                        sx={{
                          background: 'radial-gradient(#000, transparent)',
                        }}
                      />
                    ) : (
                      <CheckBoxOutlineBlankIcon
                        className="unselected"
                        htmlColor="#fff"
                        fontSize="small"
                      />
                    )}
                  </Box>
                  <Link
                    className="movie-title"
                    href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                    target="_blank"
                  >
                    {movie.title}
                  </Link>
                </Box>
              </Button>
            ) : (
              <Box sx={{ p: 1 }}>
                <Skeleton variant="rounded" width={130} height={180} />
                <Skeleton />
              </Box>
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
