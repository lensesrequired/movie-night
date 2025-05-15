import { apiFetch } from '@/helpers/fetch';
import { InviteCode } from '@/types';
import { useEffect, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

export type InviteCodeModalProps = {
  onClose: () => void;
  watchlistId: string;
};

export const InviteCodeModal = ({
  onClose,
  watchlistId,
}: InviteCodeModalProps) => {
  const [error, setError] = useState<string>('');
  const [codes, setCodes] = useState<InviteCode[]>([]);

  const loadCodes = () => {
    apiFetch(`/api/watchlist/${watchlistId}/invite`).then(
      ({ ok, data, error }) => {
        if (ok && data.codes) {
          setCodes(data.codes);
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
      },
    );
  };

  const addCode = () => {
    // TODO: loading state
    apiFetch(`/api/watchlist/${watchlistId}/invite`, { method: 'POST' }).then(
      ({ ok, data, error }) => {
        if (ok && data.code) {
          loadCodes();
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
      },
    );
  };

  useEffect(() => {
    loadCodes();
    // just on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open onClose={onClose} aria-labelledby="create-dialog-title">
      <DialogTitle id="create-dialog-title">Invite Codes</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            pt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          Invite Codes are one time use and last for a week before expiring. Use
          the Copy button to get full invite links.
          {codes.length === 0 ? (
            <div>No codes</div>
          ) : (
            <Table sx={{ minWidth: 400 }} aria-label="invite code table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Expires</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {codes.map(({ code, expiresAt }, index) => (
                  <TableRow
                    key={`code-${index}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="right">
                      <Box sx={{ minWidth: '80px' }}>
                        <IconButton color="error">
                          <DeleteIcon />
                        </IconButton>
                        <IconButton>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {code}
                    </TableCell>
                    <TableCell>
                      {new Date(expiresAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={addCode}>
          Add Code
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
