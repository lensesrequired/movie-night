import { apiFetch } from '@/helpers/fetch';
import { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

export type MembersTableProps = {
  watchlistId: string;
  managedBy: string;
};

export const MembersTable = ({ watchlistId, managedBy }: MembersTableProps) => {
  const [error, setError] = useState<string>('');
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<number>();

  const loadMembers = () => {
    setLoading(true);
    apiFetch(`/api/watchlist/${watchlistId}/members`).then(
      ({ ok, data, error }) => {
        if (ok && data.members) {
          console.log(managedBy);
          console.log(data);
          setMembers(data.members);
        } else {
          setError(error || 'Something went wrong. Please try again.');
        }
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    loadMembers();
    // just on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeMember = (username: string, index: number) => () => {
    setDeleteLoading(index);
    apiFetch(`/api/watchlist/${watchlistId}/members?username=${username}`, {
      method: 'DELETE',
    }).then(({ ok, data, error }) => {
      if (ok && data.success) {
        loadMembers();
      } else {
        setError(error || 'Something went wrong. Please try again.');
      }
      setDeleteLoading(undefined);
    });
  };

  return (
    <Box
      sx={{
        pt: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      <h3>Members</h3>
      <p>
        Removing members will take effect immediately and not require
        &quot;Save&quot;
      </p>
      <Table sx={{ minWidth: 400 }} aria-label="invite code table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Member</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array(members.length || 1).fill(
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
            : members.map((member, index) => (
                <TableRow
                  key={`member-${index}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="right">
                    <Box sx={{ maxWidth: '50px' }}>
                      {member !== managedBy && (
                        <IconButton
                          color="error"
                          onClick={removeMember(member, index)}
                          loading={deleteLoading === index}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {member}
                  </TableCell>
                  <TableCell>
                    {member === managedBy ? 'Manager' : 'Member'}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </Box>
  );
};
