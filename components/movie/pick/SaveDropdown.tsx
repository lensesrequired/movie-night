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

enum CloseOption {
  CLOSE,
  SAVE_AND_CLOSE,
  REMOVE_AND_CLOSE,
}

const closeOptions = [
  { text: 'Close', value: CloseOption.CLOSE },
  { text: 'Save for Later and Close', value: CloseOption.SAVE_AND_CLOSE },
  { text: 'Remove Movie and Close', value: CloseOption.REMOVE_AND_CLOSE },
];

export type SaveDropdownProps = {
  closeModal: () => void;
};

export const SaveDropdown = ({ closeModal }: SaveDropdownProps) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

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

  const onClick = (value: CloseOption) => () => {
    if (value === CloseOption.SAVE_AND_CLOSE) {
      // TODO
    } else if (value === CloseOption.REMOVE_AND_CLOSE) {
      // TODO
    }
    closeModal();
  };

  return (
    <>
      <ButtonGroup
        variant="outlined"
        ref={anchorRef}
        aria-label="Pick a Movie menu"
      >
        <Button onClick={onClick(CloseOption.CLOSE)}>
          {closeOptions[0].text}
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
                  {closeOptions.map(({ text, value }) => (
                    <MenuItem
                      key={`close-option-${value}`}
                      onClick={onClick(value)}
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
};
