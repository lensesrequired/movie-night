import { Watchlist, WatchlistMovie } from '@/types';
import Image from 'next/image';
import { Box, Button, Grid, Paper, Skeleton } from '@mui/material';

type MoviesGridProps = {
  isLoading?: boolean;
  movies: WatchlistMovie[];
};

export const MoviesGrid = ({ isLoading, movies }: MoviesGridProps) => {
  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Grid id="movie-grid" container spacing={2}>
        {(isLoading ? Array(6).fill(null) : movies).map((movie, index) => (
          <Grid key={`watchlist-${movie?.id || index}`}>
            {movie ? (
              <Button
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
              >
                <Box
                  sx={{
                    width: '130px',
                    textAlign: 'center',
                    textTransform: 'initial',
                  }}
                >
                  <Paper
                    elevation={24}
                    sx={{ width: '130px', height: '180px', mb: 1 }}
                  >
                    <Image
                      width={130}
                      height={180}
                      src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
                      alt={`${movie.title} poster image`}
                    />
                  </Paper>
                  {movie.title}
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
