import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Avatar,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { email, password } = formData;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/auth/login', formData, { withCredentials: true });
      
      enqueueSnackbar('Welcome back! Login successful.', { 
        variant: 'success',
        autoHideDuration: 3000,
      });
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data || 'Login failed. Please try again.';
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Helmet>
        <title>Sign In - AgoUni Online Judge</title>
        <meta name="description" content="Sign in to AgoUni Online Judge to solve programming problems and compete in coding contests." />
      </Helmet>
      
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container component="main" maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={10}
              sx={{
                p: { xs: 3, sm: 6 },
                borderRadius: 4,
                background: theme.palette.mode === 'light'
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(30, 30, 30, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Avatar sx={{ 
                    m: 1, 
                    bgcolor: 'primary.main',
                    width: 56,
                    height: 56,
                  }}>
                    <LockOutlinedIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                </motion.div>
                
                <Typography component="h1" variant="h4" sx={{ 
                  mb: 1,
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Welcome Back
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Sign in to continue your coding journey
                </Typography>

                <Box 
                  component="form" 
                  onSubmit={handleSubmit} 
                  sx={{ width: '100%' }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                    sx={{ 
                      mt: 3, 
                      mb: 2,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <MuiLink 
                      component={Link} 
                      to="/register" 
                      variant="body2"
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Don't have an account? Sign Up
                    </MuiLink>
                    <br />
                    <MuiLink 
                      component={Link} 
                      to="/" 
                      variant="body2"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontWeight: 400,
                        mt: 1,
                        display: 'inline-block',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      ← Back to Home
                    </MuiLink>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}

export default Login;
