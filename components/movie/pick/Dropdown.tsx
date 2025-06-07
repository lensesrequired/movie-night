import { PickProvider } from '@/components/movie/pick/Context';
import { Modal as PickModal } from '@/components/movie/pick/Modal';
import { PickOption, pickOptions } from '@/constants';
import { apiFetch } from '@/helpers/fetch';
import { WatchlistPick } from '@/types';
import { useEffect, useRef, useState } from 'react';
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
};

export const PickDropdown = ({
  watchlistId,
  reloadMovies,
}: PickDropdownProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPickMovieModal, setShowPickMovieModal] = useState<PickOption>();
  const [picks, setPicks] = useState<WatchlistPick[]>([]);
  const [error, setError] = useState<string>('');

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

  return (
    <>
      {showPickMovieModal && (
        <PickProvider defaultPickType={showPickMovieModal}>
          <PickModal
            onClose={() => {
              setShowPickMovieModal(undefined);
            }}
            watchlistId={watchlistId}
            reloadMovies={reloadMovies}
            retrievePicks={retrievePicks}
          />
        </PickProvider>
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
                        ...picks.map(({ name }, i) => (
                          <MenuItem
                            key={`watchlist-pick-${i}`}
                            onClick={() => {
                              console.log(name);
                            }}
                          >
                            {name}
                          </MenuItem>
                        )),
                      ]}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
