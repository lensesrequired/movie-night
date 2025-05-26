import { PickMovieModal } from '@/components/watchlist/PickMovieModal';
import { PickOption, pickOptions } from '@/constants';
import { useRef, useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

export type PickMovieModalProps = {
  watchlistId: string;
};

export default function PickMovieDropdown({
  watchlistId,
}: PickMovieModalProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showPickMovieModal, setShowPickMovieModal] = useState<PickOption>();

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

  return (
    <>
      {showPickMovieModal && (
        <PickMovieModal
          onClose={() => {
            setShowPickMovieModal(undefined);
          }}
          watchlistId={watchlistId}
          defaultChoice={showPickMovieModal}
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
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
