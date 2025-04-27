import { MouseEvent, useState } from 'react';
import SortIcon from '@mui/icons-material/Sort';
import { Button } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export enum SortOption {
  ADDED = 'Date Added',
  RATING = 'Rating',
  RELEASE_DATE = 'Release Date',
  TITLE = 'Title',
}

const options = [
  SortOption.ADDED,
  SortOption.RATING,
  SortOption.RELEASE_DATE,
  SortOption.TITLE,
];

export type MovieSortMenuProps = {
  sort: SortOption;
  setSort: (sort: SortOption) => void;
};

export const MovieSortMenu = ({ sort, setSort }: MovieSortMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClickListItem = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (
    event: MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setSort(options[index]);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="movie-sort-button"
        variant="outlined"
        startIcon={<SortIcon />}
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClickListItem}
      >
        Sort: {sort}
      </Button>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option}
            selected={option === sort}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
