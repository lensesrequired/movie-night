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
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
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
  const [copied, setCopied] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<number>();

  const loadCodes = () => {
    setLoading(true);
    apiFetch(`/api/watchlist/${watchlistId}/invite`).then(
      ({ ok, data, error }) => {
        if (ok && data.codes) {
          setCodes(data.codes);
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
        setLoading(false);
      },
    );
  };

  const addCode = () => {
    setAddLoading(true);
    apiFetch(`/api/watchlist/${watchlistId}/invite`, { method: 'POST' }).then(
      ({ ok, data, error }) => {
        if (ok && data.code) {
          loadCodes();
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
        setAddLoading(false);
      },
    );
  };

  const deleteCode = (code: string, index: number) => () => {
    setDeleteLoading(index);
    apiFetch(`/api/watchlist/${watchlistId}/invite?code=${code}`, {
      method: 'DELETE',
    }).then(({ ok, data, error }) => {
      if (ok && data.success) {
        loadCodes();
      } else {
        setError(error || 'Something went wrong. Please try again.');
      }
      setDeleteLoading(undefined);
    });
  };

  useEffect(() => {
    loadCodes();
    // just on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopy = (code: string, index: number) => () => {
    navigator.clipboard.writeText(`${window.location}?code=${code}`);
    setCopied(index);
    setTimeout(() => {
      setCopied(undefined);
    }, 1000);
  };

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
          <Table sx={{ minWidth: 400 }} aria-label="invite code table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Expires</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array(codes.length || 1).fill(
                    <TableRow>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                    </TableRow>,
                  )
                : codes.map(({ code, expiresAt }, index) => (
                    <TableRow
                      key={`code-${index}`}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="right">
                        <Box sx={{ minWidth: '80px' }}>
                          <IconButton
                            color="error"
                            onClick={deleteCode(code, index)}
                            loading={deleteLoading === index}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <Tooltip title="Copied" open={copied === index}>
                            <IconButton onClick={onCopy(code, index)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
          {!loading && codes.length === 0 && 'No codes...'}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={addCode} loading={addLoading}>
          Add Code
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
