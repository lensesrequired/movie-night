import { MovieModal } from '@/components/movie/Modal';
import { PosterDisplay } from '@/components/movie/PosterDisplay';
import { PickDropdown } from '@/components/pick/Dropdown';
import { MOVIE_POSTER_DIMENSIONS } from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { WatchlistMovie } from '@/types';
import { MouseEvent, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Button, Fab, Grid, Link, Skeleton } from '@mui/material';

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
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showMovieModal, setShowMovieModal] = useState<boolean>(false);

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

  const onWatch = () => {
    setIsUpdating(true);
    const selectedMovie = movies[selected[0]];
    apiFetch(`/api/watchlist/${watchlistId}/movie`, {
      method: 'PATCH',
      body: JSON.stringify({
        movie: { ...selectedMovie, watched: !selectedMovie.watched },
      }),
    }).then(({ ok, data, error }) => {
      if (ok && data.success) {
        reloadMovies();
        setSelected([]);
      } else if (error) {
        setError(error);
      }
      setIsUpdating(false);
    });
  };

  return (
    <Box sx={{ pt: 3, width: '100%' }}>
      {showMovieModal && (
        <MovieModal
          watchlistId={watchlistId}
          onClose={() => {
            setShowMovieModal(false);
          }}
          onSuccess={reloadMovies}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          position: 'fixed',
          width: '100%',
          bottom: 20,
          zIndex: 1000,
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            backgroundColor: '#555',
            padding: '8px',
            borderRadius: 10,
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <Fab
            color="primary"
            aria-label="edit"
            onClick={() => setShowMovieModal(true)}
          >
            <AddIcon />
          </Fab>
          <Fab variant="extended" onClick={onSelect}>
            {selected.length ? 'Unselect All' : 'Select All'}
          </Fab>
          <Fab
            color="error"
            aria-label="delete"
            disabled={!selected.length || isDeleting}
            onClick={onRemove}
          >
            <DeleteIcon />
          </Fab>
          <Fab
            aria-label="select"
            color="secondary"
            disabled={selected.length !== 1 || isUpdating}
            onClick={onWatch}
          >
            {movies?.[selected?.[0]]?.watched ? (
              <VisibilityOffIcon />
            ) : (
              <VisibilityIcon />
            )}
          </Fab>
        </Box>
      </Box>
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
                  '& .select-box,& .watched-box': {
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
                  '&.watched': {
                    opacity: 0.9,
                  },
                }}
                className={
                  (selected.includes(index) ? 'selected' : '') +
                  (movie.watched ? ' watched' : '')
                }
              >
                <Box
                  sx={{
                    width: `${MOVIE_POSTER_DIMENSIONS.width}px`,
                    textAlign: 'center',
                    textTransform: 'initial',
                  }}
                >
                  <PosterDisplay
                    src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
                    altTitle={`${movie.title} poster image`}
                  />
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
                  {movie.watched && (
                    <Box
                      sx={{
                        display: 'absolute',
                        textAlign: 'right',
                        pt: 1.5,
                        pr: 1.75,
                      }}
                      className="watched-box"
                    >
                      <CheckCircleIcon
                        color="secondary"
                        sx={{
                          background:
                            'radial-gradient(#555, #555, #555, transparent, transparent)',
                        }}
                      />
                    </Box>
                  )}
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
                <Skeleton
                  variant="rounded"
                  width={MOVIE_POSTER_DIMENSIONS.width}
                  height={MOVIE_POSTER_DIMENSIONS.height}
                />
                <Skeleton />
              </Box>
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
