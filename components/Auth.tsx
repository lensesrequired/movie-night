'use client';

import { apiFetch } from '@/helpers/fetch';
import { FormEventHandler, useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, TextField } from '@mui/material';

type AuthProps = {
  createAccount?: boolean;
  redirectTo?: string;
};

export const Auth = ({ createAccount, redirectTo }: AuthProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  const isValid = useCallback(() => {
    const isValidUsername = /[a-zA-Z0-9_]{5,30}/.test(username);
    setUsernameError(
      isValidUsername
        ? ''
        : 'Usernames must be between 5 and 30 characters and only contain letters, numbers, and underscores.',
    );

    const isValidEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
      email,
    );
    setEmailError(isValidEmail ? '' : 'Enter a valid email');

    return isValidUsername && (!createAccount || isValidEmail);
  }, [createAccount, email, username]);

  useEffect(() => {
    if (usernameError || emailError) {
      isValid();
    }
  }, [usernameError, isValid, emailError]);

  const onLogin: FormEventHandler = (e) => {
    e.preventDefault();
    if (!isLoading) {
      setIsLoading(true);
      setSubmitError('');
      if (isValid()) {
        const body: Record<string, string> = { username, password };
        if (createAccount) {
          body.email = email;
        }
        apiFetch(createAccount ? '/api/user' : '/api/authenticate', {
          method: 'POST',
          body: JSON.stringify(body),
        }).then(({ ok, data, error }) => {
          if (ok && data.authed) {
            if (createAccount) {
              window.location.assign(
                decodeURIComponent(redirectTo || '') || '/',
              );
            } else {
              window.location.reload();
            }
          } else {
            setSubmitError(error || 'Something went wrong. Please try again.');
          }
        });
      }
    }
  };

  const redirect = () => {
    if (createAccount) {
      window.location.assign(redirectTo || '/');
    } else {
      window.location.assign(
        `/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
      );
    }
  };

  return (
    <form onSubmit={onLogin}>
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
          {createAccount && (
            <TextField
              error={!!emailError}
              id="email"
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText={emailError}
            />
          )}
          <TextField
            error={!!usernameError}
            id="username"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            helperText={usernameError}
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
            type="submit"
            disabled={!username || !password || (createAccount && !email)}
            loading={isLoading}
          >
            {createAccount ? 'Create Account' : 'Login'}
          </Button>
          <Button variant="outlined" onClick={redirect}>
            {createAccount ? 'Back to Login' : 'Create Account'}
          </Button>
        </Box>
      </Box>
    </form>
  );
};
