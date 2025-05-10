export type AuthProps = {
  authed: boolean;
  username: string;
  displayName: string;
};

export type Watchlist = {
  id: string;
  title: string;
  description?: string;
  manager: string;
};

export type WatchlistMovie = {
  tmdbId: string;
  title: string;
  posterPath: string;
  addedBy: string;
  releaseDate?: number;
  dateAdded: number;
};

export type TMDBMovieLookup = {
  id: number;
  overview: string;
  title: string;
  posterPath: string;
  releaseDate: string; // Can be an empty string or a date string
};

export type TMDBMovie = {
  id: number;
  overview: string;
  title: string;
  poster_path: string | null;
  release_date: string; // Can be an empty string or a date string
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type TMDBMovieResponse = {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
};
