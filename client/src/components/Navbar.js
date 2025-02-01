import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSnackbar } from 'notistack';

function Navbar() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleLogout = async () => {
    await axios.post('http://localhost:8080/auth/logout', {}, { withCredentials: true });
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => navigate('/problems')}
          >
            <CodeIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/problems')}
          >
            Online Judge
          </Typography>
          <Button color="inherit" onClick={() => navigate('/leaderboard')}>
            Leaderboard
          </Button>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
