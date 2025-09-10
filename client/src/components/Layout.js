import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Code as CodeIcon,
  List as ListIcon,
  Leaderboard as LeaderboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  DarkMode,
  LightMode,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as ContestIcon,
  Settings as AdminIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import axiosInstance from '../utils/axios';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode, toggleColorMode } = useCustomTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', {}, { withCredentials: true });
      enqueueSnackbar('Logged out successfully', { variant: 'success' });
      navigate('/');
    } catch (error) {
      enqueueSnackbar('Logout failed', { variant: 'error' });
    }
    handleProfileMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Problems', icon: <ListIcon />, path: '/problems' },
    { text: 'Contests', icon: <ContestIcon />, path: '/contests' },
    { text: 'Submissions', icon: <AssignmentIcon />, path: '/submissions' },
    { text: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard' },
    { text: 'Admin Panel', icon: <AdminIcon />, path: '/admin' },
  ];

  const getBreadcrumbs = () => {
    const pathMap = {
      '/problems': 'Problems',
      '/contests': 'Contests',
      '/submissions': 'Submissions',
      '/leaderboard': 'Leaderboard',
      '/problem': 'Problem',
      '/contest': 'Contest',
      '/dashboard': 'Dashboard',
      '/admin': 'Admin Panel',
    };

    const pathnames = location.pathname.split('/').filter((x) => x);
    
    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          color="inherit" 
          href="/problems" 
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          onClick={(e) => { e.preventDefault(); navigate('/problems'); }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return isLast ? (
            <Typography color="text.primary" key={name}>
              {pathMap[`/${name}`] || name}
            </Typography>
          ) : (
            <Link
              key={name}
              color="inherit"
              href={routeTo}
              sx={{ textDecoration: 'none' }}
              onClick={(e) => { e.preventDefault(); navigate(routeTo); }}
            >
              {pathMap[`/${name}`] || name}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
      }}>
        <CodeIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>
          AgoUni OJ
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light + '20',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path 
                  ? theme.palette.primary.main 
                  : 'inherit' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* This can be dynamic based on current page */}
          </Typography>
          
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account menu"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        MenuListProps={{
          'aria-labelledby': 'profile-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: theme.shadows[2],
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ p: 3 }}>
            {getBreadcrumbs()}
            {children}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Layout;
