import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Code as CodeIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import axiosInstance from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    username: '',
    problemsSolved: 0,
    totalSubmissions: 0,
    acceptanceRate: 0,
    rank: 0,
    recentActivity: [],
    difficultyBreakdown: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
  });
  const [recentProblems, setRecentProblems] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user stats (we'll need to create this endpoint)
        const [userResponse, problemsResponse] = await Promise.all([
          axiosInstance.get('/user/stats', { withCredentials: true }),
          axiosInstance.get('/problems?limit=5', { withCredentials: true }),
        ]);

        // For now, we'll use mock data since the endpoint doesn't exist yet
        setUserStats({
          username: 'User',
          problemsSolved: 15,
          totalSubmissions: 32,
          acceptanceRate: 46.9,
          rank: 45,
          recentActivity: [
            { type: 'solved', problem: 'Two Sum', time: '2 hours ago' },
            { type: 'attempt', problem: 'Binary Search', time: '1 day ago' },
            { type: 'solved', problem: 'Valid Parentheses', time: '2 days ago' },
          ],
          difficultyBreakdown: {
            easy: 8,
            medium: 5,
            hard: 2,
          },
        });
        
        setRecentProblems(problemsResponse.data.slice(0, 5));
        
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [enqueueSnackbar]);

  const StatCard = ({ icon, title, value, subtitle, color, onClick }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease-in-out',
          background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
          color: 'white',
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          } : {},
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const DifficultyProgress = ({ difficulty, solved, total, color }) => {
    const percentage = total > 0 ? (solved / total) * 100 : 0;
    
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {difficulty}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {solved}/{total}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: `${color}20`,
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
              borderRadius: 4,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {percentage.toFixed(1)}% completed
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - AgoUni Online Judge</title>
        <meta name="description" content="View your coding progress, statistics, and recent activity on AgoUni Online Judge." />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ 
            mb: 1,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome back, {userStats.username}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Here's your coding journey overview
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
              title="Solved"
              value={userStats.problemsSolved}
              subtitle="Problems completed"
              color="#4CAF50"
              onClick={() => navigate('/problems')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CodeIcon sx={{ fontSize: 28 }} />}
              title="Submissions"
              value={userStats.totalSubmissions}
              subtitle="Total attempts"
              color="#2196F3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<AssessmentIcon sx={{ fontSize: 28 }} />}
              title="Acceptance"
              value={`${userStats.acceptanceRate}%`}
              subtitle="Success rate"
              color="#FF9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TrophyIcon sx={{ fontSize: 28 }} />}
              title="Rank"
              value={`#${userStats.rank}`}
              subtitle="Global ranking"
              color="#9C27B0"
              onClick={() => navigate('/leaderboard')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Progress Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Progress Overview
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Difficulty Breakdown
                  </Typography>
                  <DifficultyProgress
                    difficulty="Easy"
                    solved={userStats.difficultyBreakdown.easy}
                    total={50}
                    color="#4CAF50"
                  />
                  <DifficultyProgress
                    difficulty="Medium"
                    solved={userStats.difficultyBreakdown.medium}
                    total={70}
                    color="#FF9800"
                  />
                  <DifficultyProgress
                    difficulty="Hard"
                    solved={userStats.difficultyBreakdown.hard}
                    total={30}
                    color="#F44336"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                  <List>
                    {userStats.recentActivity.map((activity, index) => (
                      <ListItem key={index} sx={{ pl: 0 }}>
                        <ListItemIcon>
                          {activity.type === 'solved' ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <CodeIcon color="action" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {activity.type === 'solved' ? 'Solved' : 'Attempted'} {activity.problem}
                            </Typography>
                          }
                          secondary={activity.time}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                🚀 Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CodeIcon />}
                    onClick={() => navigate('/problems')}
                    sx={{ py: 1.5 }}
                  >
                    Browse Problems
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrophyIcon />}
                    onClick={() => navigate('/leaderboard')}
                    sx={{ py: 1.5 }}
                  >
                    View Leaderboard
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ScheduleIcon />}
                    sx={{ py: 1.5 }}
                    disabled
                  >
                    Contests (Soon)
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<StarIcon />}
                    sx={{ py: 1.5 }}
                    disabled
                  >
                    Favorites (Soon)
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Recommended Problems */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                💡 Recommended for You
              </Typography>
              {recentProblems.length > 0 ? (
                <List>
                  {recentProblems.map((problem, index) => (
                    <ListItem
                      key={problem._id}
                      button
                      onClick={() => navigate(`/problem/${problem._id}`)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {problem.title}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            label={problem.difficulty}
                            size="small"
                            color={
                              problem.difficulty?.toLowerCase() === 'easy'
                                ? 'success'
                                : problem.difficulty?.toLowerCase() === 'medium'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No recommendations available yet
                </Typography>
              )}
            </Paper>

            {/* Achievement Section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🏆 Achievements
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {userStats.problemsSolved >= 10 && (
                  <Chip
                    icon={<StarIcon />}
                    label="Problem Solver"
                    color="success"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {userStats.problemsSolved >= 1 && (
                  <Chip
                    icon={<CodeIcon />}
                    label="First Blood"
                    color="primary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {userStats.acceptanceRate >= 50 && (
                  <Chip
                    icon={<TrophyIcon />}
                    label="Consistent Coder"
                    color="warning"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
              </Box>

              {userStats.problemsSolved === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Start solving problems to unlock achievements!
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;
