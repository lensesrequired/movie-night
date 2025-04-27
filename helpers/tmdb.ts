import { TMDBMovie, TMDBMovieLookup } from '@/types';

export const convertTMDBResults = (results: TMDBMovie[]): TMDBMovieLookup[] => {
  return results.map(({ id, title, overview, release_date, poster_path }) => ({
    id,
    title,
    overview,
    releaseDate: release_date,
    posterPath: poster_path || '',
  }));
};
