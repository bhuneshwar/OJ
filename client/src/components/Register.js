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
  Grid,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { firstname, lastname, email, password, confirmPassword } = formData;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const validateForm = () => {
    const newErrors = {};
    
    if (!firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (firstname.length < 2) {
      newErrors.firstname = 'First name must be at least 2 characters';
    }
    
    if (!lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    } else if (lastname.length < 2) {
      newErrors.lastname = 'Last name must be at least 2 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { confirmPassword, ...submitData } = formData;
      const response = await axiosInstance.post('/auth/register', submitData);
      enqueueSnackbar('Registration successful! Please sign in.', { 
        variant: 'success',
        autoHideDuration: 4000,
      });
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data || 'Registration failed. Please try again.';
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - AgoUni Online Judge</title>
        <meta name="description" content="Create an account on AgoUni Online Judge to start solving programming problems and competing in coding contests." />
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
        <Container component="main" maxWidth="md">
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
                    bgcolor: 'secondary.main',
                    width: 56,
                    height: 56,
                  }}>
                    <PersonAddIcon sx={{ fontSize: 30 }} />
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
                  Join AgoUni
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Create your account and start your coding journey
                </Typography>

                <Box 
                  component="form" 
                  onSubmit={handleSubmit} 
                  sx={{ width: '100%' }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="firstname"
                        required
                        fullWidth
                        id="firstname"
                        label="First Name"
                        autoFocus
                        value={firstname}
                        onChange={handleChange}
                        error={!!errors.firstname}
                        helperText={errors.firstname}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'secondary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="lastname"
                        label="Last Name"
                        name="lastname"
                        value={lastname}
                        onChange={handleChange}
                        error={!!errors.lastname}
                        helperText={errors.lastname}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'secondary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
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
                              borderColor: 'secondary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
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
                              borderColor: 'secondary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={toggleConfirmPasswordVisibility}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'secondary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                    sx={{ 
                      mt: 3, 
                      mb: 2,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #8E24AA 30%, #5E35B1 90%)',
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
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <MuiLink 
                      component={Link} 
                      to="/login" 
                      variant="body2"
                      sx={{
                        textDecoration: 'none',
                        color: 'secondary.main',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Already have an account? Sign In
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

export default Register;
