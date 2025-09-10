import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Stack,
} from '@mui/material';
import {
  Code as CodeIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  CloudQueue as CloudIcon,
  PlayArrow as PlayArrowIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleColorMode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [stats, setStats] = useState({
    totalProblems: 150,
    activeUsers: 1250,
    submissions: 12500,
    contests: 25,
  });

  const features = [
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-Language Support',
      description: 'Code in Python, JavaScript, C++, Java, and more with syntax highlighting and auto-completion.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Execution',
      description: 'Lightning-fast code execution with Docker containers and optimized judging system.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <TrophyIcon sx={{ fontSize: 40 }} />,
      title: 'Competitive Programming',
      description: 'Participate in contests, compete with peers, and climb the global leaderboard.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Environment',
      description: 'Safe code execution environment with sandboxed containers and security measures.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Progress Tracking',
      description: 'Track your coding journey with detailed analytics and progress insights.',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: 'Community Driven',
      description: 'Join a thriving community of developers, share solutions, and learn together.',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
  ];

  const FeatureCard = ({ feature, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card
        sx={{
          height: '100%',
          background: feature.gradient,
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[12],
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box sx={{ mb: 2 }}>
            {feature.icon}
          </Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {feature.title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {feature.description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StatCard = ({ icon, value, label, color }) => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ mb: 1 }}>{icon}</Box>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {label}
        </Typography>
      </Paper>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>AgoUni Online Judge - Competitive Programming Platform</title>
        <meta name="description" content="Master competitive programming with AgoUni Online Judge. Solve coding challenges, participate in contests, and improve your algorithmic skills." />
        <meta name="keywords" content="online judge, competitive programming, coding contests, algorithms, data structures" />
      </Helmet>

      <Box sx={{ minHeight: '100vh' }}>
        {/* Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    mr: 2,
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                  }}
                >
                  <CodeIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  AgoUni OJ
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={toggleColorMode} color="inherit">
                  {mode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
                <Button
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{ mr: 1 }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RegisterIcon />}
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box
          sx={{
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
            color: 'white',
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                    }}
                  >
                    Master Competitive
                    <br />
                    <span style={{ 
                      background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Programming
                    </span>
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}
                  >
                    Enhance your coding skills with our modern online judge platform.
                    Solve challenging problems, participate in contests, and compete with
                    developers worldwide.
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => navigate('/register')}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'grey.100',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      Start Coding
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </Stack>

                  {/* Quick Stats */}
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          150+
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Problems
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          1.2K+
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Users
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          12K+
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Submissions
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          25+
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Contests
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -20,
                        left: -20,
                        right: -20,
                        bottom: -20,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        borderRadius: 4,
                        zIndex: -1,
                      },
                    }}
                  >
                    <Paper
                      elevation={8}
                      sx={{
                        p: 3,
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,30,30,0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                        🚀 Featured Problem
                      </Typography>
                      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                        Two Sum Algorithm
                      </Typography>
                      <Chip label="Easy" color="success" size="small" sx={{ mb: 2 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        Given an array of integers, return indices of two numbers that add up to a specific target...
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<CodeIcon />}
                        onClick={() => navigate('/register')}
                      >
                        Solve This Problem
                      </Button>
                    </Paper>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Why Choose AgoUni?
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: 'auto' }}
              >
                Everything you need to excel in competitive programming and coding interviews
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard feature={feature} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Statistics Section */}
        <Box sx={{ bgcolor: 'background.surface', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Join the Community
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                >
                  Thousands of developers are already improving their skills
                </Typography>
              </Box>
            </motion.div>

            <Grid container spacing={4}>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<CodeIcon sx={{ fontSize: 40 }} />}
                  value={stats.totalProblems}
                  label="Coding Problems"
                  color="#667eea"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<GroupsIcon sx={{ fontSize: 40 }} />}
                  value={stats.activeUsers}
                  label="Active Users"
                  color="#f093fb"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<StorageIcon sx={{ fontSize: 40 }} />}
                  value={stats.submissions}
                  label="Code Submissions"
                  color="#4facfe"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<TrophyIcon sx={{ fontSize: 40 }} />}
                  value={stats.contests}
                  label="Contests Held"
                  color="#43e97b"
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Call to Action Section */}
        <Box
          sx={{
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
            color: 'white',
            py: { xs: 8, md: 12 },
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Ready to Start Coding?
              </Typography>
              
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Join thousands of developers who are already mastering their coding skills
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mb: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<RegisterIcon />}
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  Create Free Account
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                No credit card required • Free forever • Start in 30 seconds
              </Typography>
            </motion.div>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: 'background.paper', py: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                © 2024 AgoUni Online Judge. Built with ❤️ for competitive programmers.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
