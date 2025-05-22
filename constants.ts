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
