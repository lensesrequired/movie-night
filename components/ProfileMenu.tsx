'use client';

import { AuthPageProps } from '@/components/withAuth';
import Link from 'next/link';
import { MouseEvent, useState } from 'react';
import Logout from '@mui/icons-material/Logout';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';

export const ProfileMenu = ({ displayName }: AuthPageProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar sx={{ width: 32, height: 32 }}>
            {displayName.slice(0, 1).toUpperCase()}
          </Avatar>
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Link href={'/'}>
            <ListItem sx={{ py: 0, px: 1 }}>
              <ListItemIcon>
                <PlaylistPlayIcon fontSize="small" />
              </ListItemIcon>
              My Lists
            </ListItem>
          </Link>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Link href={'/logout'}>
            <ListItem sx={{ py: 0, px: 1 }}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </ListItem>
          </Link>
        </MenuItem>
      </Menu>
    </>
  );
};
