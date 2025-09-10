import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Assignment as ProblemsIcon,
  EmojiEvents as ContestsIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as ApproveIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  CloudUpload as UploadIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import axiosInstance from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

// Mock data for demonstration
const mockStats = {
  users: {
    total: 1247,
    active: 892,
    newToday: 23,
    trend: 12.5
  },
  problems: {
    total: 156,
    published: 134,
    draft: 22,
    trend: 8.2
  },
  contests: {
    total: 28,
    active: 3,
    upcoming: 5,
    trend: 15.3
  },
  submissions: {
    total: 45683,
    today: 234,
    accepted: 28456,
    trend: 5.7
  }
};

const mockUsers = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    joinDate: '2024-01-15T10:30:00Z',
    lastLogin: '2024-03-01T14:22:00Z',
    problemsSolved: 23,
    rating: 1456
  },
  {
    id: 2,
    username: 'admin_sarah',
    email: 'sarah@agouni.com',
    role: 'admin',
    status: 'active',
    joinDate: '2023-12-01T09:15:00Z',
    lastLogin: '2024-03-01T16:45:00Z',
    problemsSolved: 89,
    rating: 2134
  },
  {
    id: 3,
    username: 'contest_master',
    email: 'master@example.com',
    role: 'moderator',
    status: 'active',
    joinDate: '2024-01-20T11:20:00Z',
    lastLogin: '2024-02-28T13:10:00Z',
    problemsSolved: 67,
    rating: 1823
  }
];

const mockProblems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    status: 'published',
    submissions: 1523,
    acceptance: 68.2,
    createdBy: 'admin_sarah',
    createdAt: '2024-01-10T10:00:00Z',
    tags: ['Array', 'Hash Table']
  },
  {
    id: 2,
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    status: 'published',
    submissions: 892,
    acceptance: 34.7,
    createdBy: 'problem_setter',
    createdAt: '2024-01-15T14:30:00Z',
    tags: ['String', 'Dynamic Programming']
  },
  {
    id: 3,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    status: 'draft',
    submissions: 0,
    acceptance: 0,
    createdBy: 'admin_sarah',
    createdAt: '2024-02-28T16:20:00Z',
    tags: ['Array', 'Dynamic Programming']
  }
];

const mockContests = [
  {
    id: 1,
    title: 'Weekly Contest #42',
    status: 'upcoming',
    participants: 156,
    startTime: '2024-03-15T10:00:00Z',
    duration: 120,
    organizer: 'contest_master',
    problems: ['Two Sum', 'Valid Parentheses', 'Merge Intervals']
  },
  {
    id: 2,
    title: 'Algorithm Championship',
    status: 'live',
    participants: 89,
    startTime: '2024-03-01T14:00:00Z',
    duration: 180,
    organizer: 'admin_sarah',
    problems: ['Hard Problem 1', 'Hard Problem 2']
  }
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [users, setUsers] = useState(mockUsers);
  const [problems, setProblems] = useState(mockProblems);
  const [contests, setContests] = useState(mockContests);
  
  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [problemDialogOpen, setProblemDialogOpen] = useState(false);
  const [contestDialogOpen, setContestDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'

  // Form states
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    tags: [],
    testCases: [],
    timeLimit: 1000,
    memoryLimit: 256
  });

  const [contestForm, setContestForm] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 120,
    type: 'public',
    maxParticipants: 100
  });

  useEffect(() => {
    // Check if user is admin
    const checkAdminAccess = async () => {
      try {
        // This would be a real API call to verify admin privileges
        // For now, we'll simulate it
        setLoading(false);
      } catch (error) {
        enqueueSnackbar('Access denied. Admin privileges required.', { variant: 'error' });
        navigate('/dashboard');
      }
    };

    checkAdminAccess();
  }, [navigate, enqueueSnackbar]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'error'
    };
    return colors[difficulty?.toLowerCase()] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      banned: 'error',
      published: 'success',
      draft: 'warning',
      upcoming: 'primary',
      live: 'success',
      finished: 'default'
    };
    return colors[status] || 'default';
  };

  const handleUserAction = async (action, userId) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'ban':
          setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, status: 'banned' } : user
          ));
          enqueueSnackbar('User banned successfully', { variant: 'success' });
          break;
        case 'activate':
          setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, status: 'active' } : user
          ));
          enqueueSnackbar('User activated successfully', { variant: 'success' });
          break;
        case 'delete':
          setUsers(prev => prev.filter(user => user.id !== userId));
          enqueueSnackbar('User deleted successfully', { variant: 'success' });
          break;
        default:
          break;
      }
    } catch (error) {
      enqueueSnackbar('Action failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProblemAction = async (action, problemId) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'publish':
          setProblems(prev => prev.map(problem => 
            problem.id === problemId ? { ...problem, status: 'published' } : problem
          ));
          enqueueSnackbar('Problem published successfully', { variant: 'success' });
          break;
        case 'unpublish':
          setProblems(prev => prev.map(problem => 
            problem.id === problemId ? { ...problem, status: 'draft' } : problem
          ));
          enqueueSnackbar('Problem unpublished successfully', { variant: 'success' });
          break;
        case 'delete':
          setProblems(prev => prev.filter(problem => problem.id !== problemId));
          enqueueSnackbar('Problem deleted successfully', { variant: 'success' });
          break;
        default:
          break;
      }
    } catch (error) {
      enqueueSnackbar('Action failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subValue, trend, icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: `${color}.light`,
                color: `${color}.contrastText`,
                mr: 2
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {subValue}
            </Typography>
            {trend && (
              <Chip
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                color={trend > 0 ? 'success' : 'error'}
                size="small"
                icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const DashboardTab = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.users.total}
            subValue={`${stats.users.active} active`}
            trend={stats.users.trend}
            icon={<UsersIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Problems"
            value={stats.problems.total}
            subValue={`${stats.problems.published} published`}
            trend={stats.problems.trend}
            icon={<ProblemsIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Contests"
            value={stats.contests.total}
            subValue={`${stats.contests.active} active`}
            trend={stats.contests.trend}
            icon={<ContestsIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Submissions"
            value={stats.submissions.total}
            subValue={`${stats.submissions.today} today`}
            trend={stats.submissions.trend}
            icon={<AnalyticsIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Platform Activity (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Mon', users: 120, submissions: 450 },
                  { name: 'Tue', users: 132, submissions: 520 },
                  { name: 'Wed', users: 95, submissions: 380 },
                  { name: 'Thu', users: 158, submissions: 600 },
                  { name: 'Fri', users: 189, submissions: 720 },
                  { name: 'Sat', users: 234, submissions: 890 },
                  { name: 'Sun', users: 198, submissions: 650 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.light}
                  name="Active Users"
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stackId="2"
                  stroke={theme.palette.secondary.main}
                  fill={theme.palette.secondary.light}
                  name="Submissions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Problem Difficulty Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Easy', value: 45, color: theme.palette.success.main },
                    { name: 'Medium', value: 67, color: theme.palette.warning.main },
                    { name: 'Hard', value: 44, color: theme.palette.error.main },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Easy', value: 45, color: theme.palette.success.main },
                    { name: 'Medium', value: 67, color: theme.palette.warning.main },
                    { name: 'Hard', value: 44, color: theme.palette.error.main },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <UsersIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="New user registered: john_coder"
              secondary="2 minutes ago"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ProblemsIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Problem 'Maximum Subarray' was published"
              secondary="15 minutes ago"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ContestsIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Contest 'Weekly Challenge #42' created"
              secondary="1 hour ago"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );

  const UsersTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogMode('create');
            setUserForm({
              username: '',
              email: '',
              role: 'user',
              status: 'active'
            });
            setUserDialogOpen(true);
          }}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Role</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Problems Solved</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">Last Login</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TableRow hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : user.role === 'moderator' ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{user.problemsSolved}</TableCell>
                  <TableCell align="center">{user.rating}</TableCell>
                  <TableCell align="center">
                    <Typography variant="caption">
                      {formatDistanceToNow(new Date(user.lastLogin))} ago
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedItem(user);
                          setDialogMode('view');
                          setUserDialogOpen(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedItem(user);
                          setUserForm(user);
                          setDialogMode('edit');
                          setUserDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      {user.status === 'active' ? (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleUserAction('ban', user.id)}
                        >
                          <BlockIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleUserAction('activate', user.id)}
                        >
                          <ApproveIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleUserAction('delete', user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const ProblemsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Problem Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogMode('create');
            setProblemForm({
              title: '',
              description: '',
              difficulty: 'Easy',
              tags: [],
              testCases: [],
              timeLimit: 1000,
              memoryLimit: 256
            });
            setProblemDialogOpen(true);
          }}
        >
          Add Problem
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell align="center">Difficulty</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Submissions</TableCell>
              <TableCell align="center">Acceptance</TableCell>
              <TableCell align="center">Tags</TableCell>
              <TableCell align="center">Created By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {problems.map((problem, index) => (
              <motion.tr
                key={problem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TableRow hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {problem.title}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={problem.difficulty}
                      color={getDifficultyColor(problem.difficulty)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={problem.status}
                      color={getStatusColor(problem.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{problem.submissions}</TableCell>
                  <TableCell align="center">{problem.acceptance}%</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {problem.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{problem.createdBy}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      {problem.status === 'draft' ? (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleProblemAction('publish', problem.id)}
                        >
                          <ApproveIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleProblemAction('unpublish', problem.id)}
                        >
                          <WarningIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleProblemAction('delete', problem.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const ContestsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Contest Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogMode('create');
            setContestForm({
              title: '',
              description: '',
              startTime: '',
              duration: 120,
              type: 'public',
              maxParticipants: 100
            });
            setContestDialogOpen(true);
          }}
        >
          Create Contest
        </Button>
      </Box>

      <Grid container spacing={3}>
        {contests.map((contest, index) => (
          <Grid item xs={12} md={6} key={contest.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {contest.title}
                    </Typography>
                    <Chip
                      label={contest.status}
                      color={getStatusColor(contest.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Participants: {contest.participants}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Duration: {contest.duration} minutes
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Organizer: {contest.organizer}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Problems ({contest.problems.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {contest.problems.map((problem, idx) => (
                        <Chip
                          key={idx}
                          label={problem}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button size="small" startIcon={<ViewIcon />}>
                    View
                  </Button>
                  <Button size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<AnalyticsIcon />}>
                    Analytics
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const SystemTab = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        System Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <StorageIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Database" secondary="Operational" />
                <Chip label="99.9%" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Security" secondary="All systems secure" />
                <Chip label="Secure" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AnalyticsIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Performance" secondary="High load detected" />
                <Chip label="85%" color="warning" size="small" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* System Configuration */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Maintenance Mode" secondary="System maintenance" />
                <ListItemSecondaryAction>
                  <Switch />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="User Registration" secondary="Allow new registrations" />
                <ListItemSecondaryAction>
                  <Switch defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Email Notifications" secondary="Send system notifications" />
                <ListItemSecondaryAction>
                  <Switch defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Backup & Export */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Management
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ height: 60 }}
                >
                  Backup Data
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  sx={{ height: 60 }}
                >
                  Export Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  sx={{ height: 60 }}
                >
                  Export Problems
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  sx={{ height: 60 }}
                >
                  Send Newsletter
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  if (loading) {
    return <LoadingSpinner text="Loading admin panel..." fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - AgoUni Online Judge</title>
        <meta name="description" content="Administrative interface for managing users, problems, contests, and system settings." />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
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
            🛠️ Admin Panel
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your online judge platform
          </Typography>
        </Box>

        {/* Admin Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          You have admin privileges. Use these tools responsibly to manage the platform.
        </Alert>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<UsersIcon />} label="Users" />
            <Tab icon={<ProblemsIcon />} label="Problems" />
            <Tab icon={<ContestsIcon />} label="Contests" />
            <Tab icon={<SettingsIcon />} label="System" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && <DashboardTab key="dashboard" />}
            {activeTab === 1 && <UsersTab key="users" />}
            {activeTab === 2 && <ProblemsTab key="problems" />}
            {activeTab === 3 && <ContestsTab key="contests" />}
            {activeTab === 4 && <SystemTab key="system" />}
          </AnimatePresence>
        </Box>

        {/* Loading Overlay */}
        {loading && (
          <LinearProgress 
            sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}
          />
        )}

        {/* User Dialog */}
        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' ? 'Add New User' : dialogMode === 'edit' ? 'Edit User' : 'User Details'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                value={userForm.username}
                onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                disabled={dialogMode === 'view'}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                disabled={dialogMode === 'view'}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  label="Role"
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                  disabled={dialogMode === 'view'}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="moderator">Moderator</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={userForm.status}
                  label="Status"
                  onChange={(e) => setUserForm(prev => ({ ...prev, status: e.target.value }))}
                  disabled={dialogMode === 'view'}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="banned">Banned</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialogOpen(false)}>
              {dialogMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {dialogMode !== 'view' && (
              <Button variant="contained" onClick={() => setUserDialogOpen(false)}>
                {dialogMode === 'create' ? 'Create' : 'Save'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminPanel;
