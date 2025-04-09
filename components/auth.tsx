'use client';

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

  const onLogin = () => {
    setSubmitError('');
    if (isValid()) {
      fetch('/api/authenticate', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authed) {
            console.log('redirect');
          } else if (data._message) {
            setSubmitError(data._message);
          } else {
            setSubmitError('Unknown error. Please try again.');
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const onCreateAccount = () => {
    setSubmitError('');
    if (isValid()) {
      fetch('/api/user', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authed) {
            console.log('redirect');
          } else if (data._message) {
            setSubmitError(data._message);
          } else {
            setSubmitError('Unknown error. Please try again.');
          }
        })
        .catch((err) => {
          console.log(err);
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
          onClick={onLogin}
          disabled={!email || !password}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          onClick={onCreateAccount}
          disabled={!email || !password}
        >
          Create Account
        </Button>
      </Box>
    </Box>
  );
};
