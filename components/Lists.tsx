import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';

export const Lists = () => {
  return (
    <Box
      sx={{
        height: '75vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'stretch',
        gap: '1rem',
      }}
    >
      <h2>Nothing to see here! Create a Watchlist to get started!</h2>
      <Button variant="contained" size="large" startIcon={<AddIcon />}>
        Start Listin'
      </Button>
    </Box>
  );
};
