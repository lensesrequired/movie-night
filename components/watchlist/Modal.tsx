import { apiFetch } from '@/helpers/fetch';
import { Watchlist } from '@/types';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

export type WatchlistModalProps = {
  onClose: () => void;
  onSuccess: () => void;
  defaults?: Watchlist;
};

export const WatchlistModal = ({
  onClose,
  onSuccess,
  defaults,
}: WatchlistModalProps) => {
  const [title, setTitle] = useState<string>(defaults?.title || '');
  const [description, setDescription] = useState<string>(
    defaults?.description || '',
  );
  const [error, setError] = useState<string>('');

  const onSubmit = async () => {
    apiFetch(`/api/watchlist${defaults?.id ? `/${defaults.id}` : ''}`, {
      method: defaults ? 'PATCH' : 'POST',
      body: JSON.stringify({ title, description }),
    }).then(({ ok, data, error }) => {
      if (ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(error || 'Something went wrong. Please try again.');
      }
    });
  };

  return (
    <Dialog open onClose={onClose} aria-labelledby="create-dialog-title">
      <DialogTitle id="create-dialog-title">Create a Watchlist</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            pt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: '40vw', // TODO: mobile styles
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            id="title"
            label="Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            id="description"
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="outlined"
          onClick={onSubmit}
          disabled={!title}
          autoFocus
        >
          {defaults ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
