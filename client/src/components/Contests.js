import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  EmojiEvents as ContestIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns';
import axiosInstance from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

const Contests = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeTab, setActiveTab] = useState(0);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newContest, setNewContest] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 120, // minutes
    type: 'public',
    maxParticipants: 100,
  });

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        
        // Mock contest data
        const mockContests = [
          {
            _id: '1',
            title: 'Weekly Programming Challenge #42',
            description: 'Test your algorithmic skills with a variety of problems ranging from easy to hard.',
            organizer: { username: 'contest_admin', avatar: null },
            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(), // Tomorrow + 2 hours
            duration: 120,
            participants: 156,
            maxParticipants: 200,
            problems: ['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4'],
            type: 'public',
            status: 'upcoming',
            registrationOpen: true,
            isRegistered: false,
            prize: '$500 + Swag',
          },
          {
            _id: '2',
            title: 'Algorithm Masters Championship',
            description: 'Advanced competitive programming contest for experienced programmers.',
            organizer: { username: 'algo_master', avatar: null },
            startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            duration: 180,
            participants: 89,
            maxParticipants: 100,
            problems: ['Hard Problem 1', 'Hard Problem 2', 'Hard Problem 3'],
            type: 'public',
            status: 'live',
            registrationOpen: false,
            isRegistered: true,
            prize: '$1000 + Certificate',
          },
          {
            _id: '3',
            title: 'Beginner Friendly Contest',
            description: 'Perfect for those starting their competitive programming journey.',
            organizer: { username: 'newbie_helper', avatar: null },
            startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            endTime: new Date(Date.now() - 82800000).toISOString(), // Yesterday + 1 hour
            duration: 60,
            participants: 234,
            maxParticipants: 300,
            problems: ['Easy Problem 1', 'Easy Problem 2'],
            type: 'public',
            status: 'finished',
            registrationOpen: false,
            isRegistered: true,
            prize: 'Certificates + Badges',
          }
        ];
        
        setContests(mockContests);
      } catch (error) {
        enqueueSnackbar('Failed to load contests', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [enqueueSnackbar]);

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    
    if (isBefore(now, startTime)) return 'upcoming';
    if (isAfter(now, endTime)) return 'finished';
    return 'live';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'live': return 'success';
      case 'finished': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <ScheduleIcon />;
      case 'live': return <PlayIcon />;
      case 'finished': return <TrophyIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const handleRegisterContest = async (contestId) => {
    try {
      // Mock registration
      setContests(prev => prev.map(contest => 
        contest._id === contestId 
          ? { ...contest, isRegistered: !contest.isRegistered, participants: contest.isRegistered ? contest.participants - 1 : contest.participants + 1 }
          : contest
      ));
      
      enqueueSnackbar('Registration updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update registration', { variant: 'error' });
    }
  };

  const handleCreateContest = async () => {
    try {
      const contest = {
        ...newContest,
        _id: Date.now().toString(),
        organizer: { username: 'current_user' },
        participants: 0,
        status: 'upcoming',
        registrationOpen: true,
        isRegistered: false,
      };
      
      setContests(prev => [contest, ...prev]);
      setCreateDialogOpen(false);
      setNewContest({
        title: '',
        description: '',
        startTime: '',
        duration: 120,
        type: 'public',
        maxParticipants: 100,
      });
      
      enqueueSnackbar('Contest created successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to create contest', { variant: 'error' });
    }
  };

  const upcomingContests = contests.filter(c => getContestStatus(c) === 'upcoming');
  const liveContests = contests.filter(c => getContestStatus(c) === 'live');
  const finishedContests = contests.filter(c => getContestStatus(c) === 'finished');

  const ContestCard = ({ contest, index }) => {
    const status = getContestStatus(contest);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card 
          sx={{ 
            height: '100%',
            position: 'relative',
            transition: 'all 0.3s ease-in-out',
            border: status === 'live' ? `2px solid ${theme.palette.success.main}` : 'none',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            }
          }}
        >
          {status === 'live' && (
            <Box sx={{ 
              position: 'absolute',
              top: -1,
              left: -1,
              right: -1,
              height: 4,
              background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
              borderRadius: '4px 4px 0 0',
            }} />
          )}
          
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {contest.title}
              </Typography>
              <Chip
                icon={getStatusIcon(status)}
                label={status.toUpperCase()}
                color={getStatusColor(status)}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {contest.description}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={contest.type === 'public' ? <PublicIcon /> : <PrivateIcon />}
                label={contest.type}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<TimerIcon />}
                label={`${contest.duration}m`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<GroupIcon />}
                label={`${contest.participants}/${contest.maxParticipants}`}
                size="small"
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {format(new Date(contest.startTime), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                by {contest.organizer.username}
              </Typography>
            </Box>
            
            {contest.prize && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrophyIcon fontSize="small" color="warning" />
                <Typography variant="body2" color="text.secondary">
                  {contest.prize}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Problems ({contest.problems.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {contest.problems.slice(0, 3).map((problem, idx) => (
                <Chip
                  key={idx}
                  label={problem}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {contest.problems.length > 3 && (
                <Chip
                  label={`+${contest.problems.length - 3} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          </CardContent>
          
          <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
            {status === 'upcoming' && contest.registrationOpen && (
              <Button
                variant={contest.isRegistered ? "outlined" : "contained"}
                size="small"
                onClick={() => handleRegisterContest(contest._id)}
                startIcon={contest.isRegistered ? <StarIcon /> : <GroupIcon />}
              >
                {contest.isRegistered ? 'Registered' : 'Register'}
              </Button>
            )}
            
            {status === 'live' && contest.isRegistered && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<PlayIcon />}
                onClick={() => navigate(`/contest/${contest._id}`)}
              >
                Join Contest
              </Button>
            )}
            
            {status === 'finished' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate(`/contest/${contest._id}/results`)}
              >
                View Results
              </Button>
            )}
            
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => navigate(`/contest/${contest._id}/details`)}
            >
              Details
            </Button>
          </CardActions>
        </Card>
      </motion.div>
    );
  };

  const ContestStats = ({ contests, title }) => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ContestIcon />
        {title}
      </Typography>
      <Grid container spacing={3}>
        {contests.length > 0 ? (
          contests.map((contest, index) => (
            <Grid item xs={12} sm={6} md={4} key={contest._id}>
              <ContestCard contest={contest} index={index} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ContestIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No {title.toLowerCase()} found
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );

  if (loading) {
    return <LoadingSpinner text="Loading contests..." fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Contests - AgoUni Online Judge</title>
        <meta name="description" content="Participate in programming contests, compete with other developers, and win prizes." />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ 
              mb: 1,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              🏆 Contests
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Compete, learn, and win amazing prizes
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ height: 'fit-content' }}
          >
            Create Contest
          </Button>
        </Box>

        {/* Live Contests - Priority Display */}
        {liveContests.length > 0 && (
          <ContestStats contests={liveContests} title="🔴 Live Contests" />
        )}

        {/* Upcoming Contests */}
        <ContestStats contests={upcomingContests} title="📅 Upcoming Contests" />

        {/* Recently Finished Contests */}
        <ContestStats contests={finishedContests} title="🏁 Recent Contests" />

        {/* Create Contest Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon />
              Create New Contest
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contest Title"
                  value={newContest.title}
                  onChange={(e) => setNewContest(prev => ({ ...prev, title: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newContest.description}
                  onChange={(e) => setNewContest(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date & Time"
                  type="datetime-local"
                  value={newContest.startTime}
                  onChange={(e) => setNewContest(prev => ({ ...prev, startTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={newContest.duration}
                  onChange={(e) => setNewContest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Contest Type</InputLabel>
                  <Select
                    value={newContest.type}
                    label="Contest Type"
                    onChange={(e) => setNewContest(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Participants"
                  type="number"
                  value={newContest.maxParticipants}
                  onChange={(e) => setNewContest(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCreateContest}
              disabled={!newContest.title || !newContest.startTime}
            >
              Create Contest
            </Button>
          </DialogActions>
        </Dialog>

        {/* Empty State */}
        {contests.length === 0 && !loading && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <TrophyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No contests available
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Be the first to create a contest and challenge the community!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create First Contest
            </Button>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Contests;
