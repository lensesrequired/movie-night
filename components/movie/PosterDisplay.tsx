import { MOVIE_POSTER_DIMENSIONS } from '@/constants';
import Image from 'next/image';
import { Paper } from '@mui/material';

type PosterDisplayProps = {
  src: string;
  altTitle: string;
};

export const PosterDisplay = ({ src, altTitle }: PosterDisplayProps) => {
  return (
    <Paper
      className="overlay"
      elevation={24}
      sx={{
        width: `${MOVIE_POSTER_DIMENSIONS.width}px`,
        height: `${MOVIE_POSTER_DIMENSIONS.height}px`,
        mb: 1,
      }}
    >
      <Image
        width={MOVIE_POSTER_DIMENSIONS.width}
        height={MOVIE_POSTER_DIMENSIONS.height}
        src={src}
        alt={altTitle}
      />
    </Paper>
  );
};
