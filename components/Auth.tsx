'use client';

import { apiFetch } from '@/helpers/fetch';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, TextField } from '@mui/material';

export const Auth = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  const isValid = useCallback(() => {
    const isEmailValid = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
      email,
    );
    setEmailError(isEmailValid ? '' : 'Enter a valid email');

    return isEmailValid;
  }, [email]);

  useEffect(() => {
    if (emailError) {
      isValid();
    }
  }, [emailError, isValid]);

  const onLogin = (create?: boolean) => {
    setSubmitError('');
    if (isValid()) {
      apiFetch(create ? '/api/user' : '/api/authenticate', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }).then(({ ok, data, error }) => {
        if (ok && data.authed) {
          window.location.reload();
        } else {
          setSubmitError(error || 'Something went wrong. Please try again.');
        }
      });
    }
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
        {submitError && <Alert severity="error">{submitError}</Alert>}
        <TextField
          error={!!emailError}
          id="email"
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText={emailError}
        />
        <TextField
          id="password"
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => {
            onLogin();
          }}
          disabled={!email || !password}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            onLogin(true);
          }}
          disabled={!email || !password}
        >
          Create Account
        </Button>
      </Box>
    </Box>
  );
};
