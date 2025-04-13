export type AuthProps = {
  authed: boolean;
  email: string;
  displayName: string;
};

export type Watchlist = {
  id: string;
  title: string;
  description?: string;
  owned: boolean;
};
