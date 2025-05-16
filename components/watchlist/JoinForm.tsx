'use client';

import { apiFetch } from '@/helpers/fetch';
import { useState } from 'react';
import { Alert, Box, Button, TextField } from '@mui/material';

type JoinFormProps = {
  defaultCode?: string;
};

export const JoinForm = ({ defaultCode }: JoinFormProps) => {
  const [error, setError] = useState<string>('');
  const [code, setCode] = useState<string>(defaultCode || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onJoin = () => {
    setIsLoading(true);
    apiFetch('/api/watchlist/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }).then(({ ok, data, error }) => {
      if (ok && data.watchlistId) {
        window.location.assign(`/watchlist/${data.watchlistId}`);
      } else if (error) {
        setError(error);
      }
      setIsLoading(false);
    });
  };

  return (
    <Box
      sx={{
        height: '75vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'stretch',
      }}
    >
      <Box
        sx={{ display: 'grid', gap: '1rem', flexGrow: 1, maxWidth: '30rem' }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          id="code"
          label="Invite Code"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button
          loading={isLoading}
          variant="contained"
          onClick={() => {
            onJoin();
          }}
          disabled={!code}
        >
          Join Watchlist
        </Button>
      </Box>
    </Box>
  );
};
