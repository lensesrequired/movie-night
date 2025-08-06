import { PickProvider } from '@/components/movie/pick/Context';
import { Modal as PickModal } from '@/components/movie/pick/Modal';
import { PickOption, pickOptions } from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { timeBetweenDates } from '@/helpers/time';
import { WatchlistMovie, WatchlistPick } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Box, Divider, Skeleton } from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

export type PickDropdownProps = {
  watchlistId: string;
  reloadMovies: () => void;
  movies: WatchlistMovie[];
};

export const PickDropdown = ({
  watchlistId,
  reloadMovies,
  movies,
}: PickDropdownProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPickMovieModal, setShowPickMovieModal] = useState<PickOption>();
  const [picks, setPicks] = useState<WatchlistPick[]>([]);
  const [existingPick, setExistingPick] = useState<WatchlistPick>();
  const [error, setError] = useState<string>('');
  const [movieLookup, setMovieLookup] = useState<WatchlistMovie>();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const retrievePicks = async () => {
    setIsLoading(true);
    apiFetch(`/api/watchlist/${watchlistId}/picks`).then(
      ({ ok, data, error }) => {
        if (ok && data.picks) {
          setPicks(data.picks);
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
        setIsLoading(false);
      },
    );
  };

  useEffect(() => {
    retrievePicks();
  }, []);

  const pickedMovie = useMemo(() => {
    if (movieLookup) {
      return movieLookup;
    }
    if (existingPick && existingPick.movie && movies) {
      const movieDetails = movies.find(
        ({ tmdbId }) => tmdbId === existingPick.movie,
      );
      if (!movieDetails) {
        apiFetch(`/api/movie?movieId=${existingPick.movie}`, {})
          .then(({ ok, data, error }) => {
            if (ok) {
              return data;
            } else if (error) {
              setError(error);
            }
          })
          .then((movieResult) => {
            setMovieLookup(movieResult.results[0] as WatchlistMovie);
          });
      }
      return movieDetails;
    }
  }, [existingPick, movies, movieLookup]);

  return (
    <PickProvider
      defaultPickType={showPickMovieModal}
      existingPick={existingPick}
      pickedMovie={pickedMovie}
    >
      {(showPickMovieModal || existingPick) && (
        <PickModal
          onClose={() => {
            setShowPickMovieModal(undefined);
            setExistingPick(undefined);
          }}
          watchlistId={watchlistId}
          reloadMovies={reloadMovies}
          retrievePicks={retrievePicks}
          movies={movies}
        />
      )}
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="Pick a Movie menu"
      >
        <Button
          onClick={() => {
            setShowPickMovieModal(PickOption.RANDOM_SELECTION);
          }}
        >
          Pick a Movie
        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="pick a movie"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {pickOptions.map(({ text, value }) => (
                    <MenuItem
                      key={value}
                      onClick={() => {
                        setShowPickMovieModal(value);
                      }}
                    >
                      {text}
                    </MenuItem>
                  ))}
                  {isLoading
                    ? [
                        <Divider key="watchlist-pick-divider" />,
                        <Box key="watchlist-pick-loader" sx={{ px: 2 }}>
                          <Skeleton />
                        </Box>,
                      ]
                    : [
                        <Divider key="watchlist-pick-divider" />,
                        error && (
                          <Box
                            key="watchlist-pick-error"
                            color="error.main"
                            sx={{ px: 2 }}
                          >
                            {error}
                          </Box>
                        ),
                        ...picks.map(
                          (
                            {
                              name,
                              pickType,
                              expiresAt,
                              votingExpiresAt,
                              ...rest
                            },
                            i,
                          ) => {
                            const expiresTime = timeBetweenDates(
                              new Date(),
                              new Date(expiresAt),
                            );
                            let expiryText = expiresTime
                              ? `Expires in ${expiresTime}`
                              : 'Expired';
                            if (votingExpiresAt) {
                              const votingExpiresTime = timeBetweenDates(
                                new Date(),
                                new Date(votingExpiresAt),
                              );
                              expiryText = votingExpiresTime
                                ? `Voting ends in ${votingExpiresTime}`
                                : 'Voting ended';
                            }
                            return (
                              <MenuItem
                                key={`watchlist-pick-${i}`}
                                onClick={() => {
                                  setExistingPick({
                                    name,
                                    pickType,
                                    expiresAt,
                                    votingExpiresAt,
                                    ...rest,
                                  });
                                }}
                              >
                                {name} ({expiryText})
                              </MenuItem>
                            );
                          },
                        ),
                      ]}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </PickProvider>
  );
};
