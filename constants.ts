export const MAX_INVITE_CODES = 10;
export const MAX_MOVIES = 250;
export const MAX_MEMBERS = 50;
export const MAX_PICKS = 10;

export const MOVIE_POSTER_DIMENSIONS = { width: 150, height: 225 };

export enum DurationOption {
  WEEK = 'WEEK',
  DAY = 'DAY',
}

export enum PickOption {
  RANDOM_SELECTION = 'RANDOM_SELECTION',
  VOTING_STANDARD = 'VOTING_STANDARD',
  VOTING_RANKED = 'VOTING_RANKED',
}

export const pickOptions = [
  { text: 'Random Selection', value: PickOption.RANDOM_SELECTION },
  { text: 'Voting (standard)', value: PickOption.VOTING_STANDARD },
  { text: 'Voting (ranked choice)', value: PickOption.VOTING_RANKED },
];

export enum MoviePoolOption {
  ALL_MOVIES = 'all-movies',
  SELECTED_MOVIES = 'selected-movies',
}
