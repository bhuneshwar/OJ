import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Forum as ForumIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Reply as ReplyIcon,
  MoreVert as MoreVertIcon,
  Report as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { formatDistanceToNow } from 'date-fns';
import axiosInstance from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

const ProblemDiscussion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeTab, setActiveTab] = useState(0);
  const [discussions, setDiscussions] = useState([]);
  const [hints, setHints] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    const fetchDiscussionData = async () => {
      try {
        setLoading(true);
        
        // Mock data - replace with actual API calls
        const mockDiscussions = [
          {
            _id: '1',
            author: { username: 'coder123', avatar: null },
            content: 'Can someone explain the optimal approach for this problem? I\'m getting TLE with my current solution.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            likes: 5,
            dislikes: 0,
            replies: [
              {
                _id: '1-1',
                author: { username: 'expert_dev', avatar: null },
                content: 'Try using a hash map to optimize the lookup time. This should reduce complexity from O(n²) to O(n).',
                timestamp: new Date(Date.now() - 3000000).toISOString(),
                likes: 8,
                dislikes: 0,
              }
            ],
            isLiked: false,
            isDisliked: false,
          },
          {
            _id: '2',
            author: { username: 'algorithm_master', avatar: null },
            content: 'Here\'s a detailed explanation of the two-pointer technique for this problem...',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            likes: 12,
            dislikes: 1,
            replies: [],
            isLiked: true,
            isDisliked: false,
          }
        ];

        const mockHints = [
          {
            _id: 'h1',
            title: 'Hint 1: Understanding the Problem',
            content: 'Think about what data structure would allow you to find elements efficiently.',
            difficulty: 'Easy',
            helpful: 15,
          },
          {
            _id: 'h2',
            title: 'Hint 2: Optimization Strategy',
            content: 'Consider using a hash map to store values and their indices as you iterate through the array.',
            difficulty: 'Medium',
            helpful: 23,
          }
        ];

        const mockSolutions = [
          {
            _id: 's1',
            author: { username: 'top_coder', avatar: null },
            title: 'Elegant Hash Map Solution',
            language: 'python',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            votes: 45,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            isUpvoted: false,
          }
        ];

        setDiscussions(mockDiscussions);
        setHints(mockHints);
        setSolutions(mockSolutions);
      } catch (error) {
        enqueueSnackbar('Failed to load discussion data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussionData();
  }, [id, enqueueSnackbar]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const newDiscussion = {
        _id: Date.now().toString(),
        author: { username: 'current_user', avatar: null },
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        replies: [],
        isLiked: false,
        isDisliked: false,
      };
      
      setDiscussions(prev => [newDiscussion, ...prev]);
      setNewComment('');
      enqueueSnackbar('Comment posted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to post comment', { variant: 'error' });
    }
  };

  const handleLike = async (discussionId, isReply = false, replyId = null) => {
    try {
      if (isReply) {
        setDiscussions(prev => prev.map(discussion => {
          if (discussion._id === discussionId) {
            return {
              ...discussion,
              replies: discussion.replies.map(reply => {
                if (reply._id === replyId) {
                  return {
                    ...reply,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    isLiked: !reply.isLiked,
                    isDisliked: false,
                  };
                }
                return reply;
              })
            };
          }
          return discussion;
        }));
      } else {
        setDiscussions(prev => prev.map(discussion => {
          if (discussion._id === discussionId) {
            return {
              ...discussion,
              likes: discussion.isLiked ? discussion.likes - 1 : discussion.likes + 1,
              isLiked: !discussion.isLiked,
              isDisliked: false,
            };
          }
          return discussion;
        }));
      }
    } catch (error) {
      enqueueSnackbar('Failed to update like', { variant: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading discussion..." fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Problem Discussion - AgoUni Online Judge</title>
        <meta name="description" content="Discuss solutions, share hints, and collaborate with other coders on this problem." />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ReplyIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back to Problem
          </Button>
          
          <Typography variant="h4" sx={{ 
            mb: 1,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            💬 Problem Discussion
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Collaborate and learn from the community
          </Typography>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Discussions" icon={<ForumIcon />} />
            <Tab label="Hints" icon={<StarIcon />} />
            <Tab label="Solutions" icon={<StarBorderIcon />} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <AnimatePresence mode="wait">
              {/* Discussions Tab */}
              {activeTab === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* New Comment Form */}
                  <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        💭 Start a Discussion
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Share your thoughts, ask questions, or help others..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          startIcon={<SendIcon />}
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim()}
                        >
                          Post Comment
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Discussion List */}
                  <List>
                    {discussions.map((discussion, index) => (
                      <motion.div
                        key={discussion._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ListItem alignItems="flex-start" sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">
                                  {discussion.author.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDistanceToNow(new Date(discussion.timestamp))} ago
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {discussion.content}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleLike(discussion._id)}
                                    color={discussion.isLiked ? 'primary' : 'default'}
                                  >
                                    <ThumbUpIcon fontSize="small" />
                                  </IconButton>
                                  <Typography variant="caption">{discussion.likes}</Typography>
                                  
                                  <IconButton size="small">
                                    <ReplyIcon fontSize="small" />
                                  </IconButton>
                                  <Typography variant="caption">Reply</Typography>
                                </Box>
                                
                                {/* Replies */}
                                {discussion.replies.length > 0 && (
                                  <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                                    {discussion.replies.map((reply) => (
                                      <Box key={reply._id} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <Avatar sx={{ width: 24, height: 24 }}>
                                            <PersonIcon fontSize="small" />
                                          </Avatar>
                                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {reply.author.username}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {formatDistanceToNow(new Date(reply.timestamp))} ago
                                          </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          {reply.content}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <IconButton 
                                            size="small" 
                                            onClick={() => handleLike(discussion._id, true, reply._id)}
                                            color={reply.isLiked ? 'primary' : 'default'}
                                          >
                                            <ThumbUpIcon fontSize="small" />
                                          </IconButton>
                                          <Typography variant="caption">{reply.likes}</Typography>
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </motion.div>
                    ))}
                  </List>

                  {discussions.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                      <ForumIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h5" gutterBottom>
                        No discussions yet
                      </Typography>
                      <Typography color="text.secondary">
                        Be the first to start a discussion about this problem!
                      </Typography>
                    </Paper>
                  )}
                </motion.div>
              )}

              {/* Hints Tab */}
              {activeTab === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    💡 Problem Hints
                  </Typography>
                  
                  {hints.map((hint, index) => (
                    <motion.div
                      key={hint._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                              {hint.title}
                            </Typography>
                            <Chip 
                              label={hint.difficulty} 
                              size="small"
                              color={hint.difficulty === 'Easy' ? 'success' : hint.difficulty === 'Medium' ? 'warning' : 'error'}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {hint.content}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbUpIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {hint.helpful} people found this helpful
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {hints.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                      <StarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h5" gutterBottom>
                        No hints available
                      </Typography>
                      <Typography color="text.secondary">
                        Try to solve the problem on your own first!
                      </Typography>
                    </Paper>
                  )}
                </motion.div>
              )}

              {/* Solutions Tab */}
              {activeTab === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    ⭐ Community Solutions
                  </Typography>
                  
                  {solutions.map((solution, index) => (
                    <motion.div
                      key={solution._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card sx={{ mb: 2, cursor: 'pointer' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                              {solution.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip 
                                label={solution.language.toUpperCase()} 
                                size="small" 
                                variant="outlined"
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ThumbUpIcon fontSize="small" color="action" />
                                <Typography variant="caption">{solution.votes}</Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body2">
                              by {solution.author.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(solution.timestamp))} ago
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Chip 
                              label={`Time: ${solution.timeComplexity}`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`Space: ${solution.spaceComplexity}`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {solutions.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                      <StarBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h5" gutterBottom>
                        No solutions shared yet
                      </Typography>
                      <Typography color="text.secondary">
                        Solve this problem and share your solution with the community!
                      </Typography>
                    </Paper>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ProblemDiscussion;
