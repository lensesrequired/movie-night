import { TMDBMovie, TMDBMovieBase } from '@/types';

export const convertTMDBResults = (results: TMDBMovie[]): TMDBMovieBase[] => {
  return results.map(({ id, title, overview, release_date, poster_path }) => ({
    id,
    title,
    overview,
    release_date,
    poster_path,
  }));
};
