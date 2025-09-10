import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import axiosInstance from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  cpp: cpp(),
  java: java(),
};

const Submissions = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        
        // Mock data since endpoint doesn't exist yet
        const mockSubmissions = [
          {
            _id: '1',
            problem: { title: 'Two Sum', _id: 'prob1' },
            language: 'python',
            status: 'Accepted',
            executionTime: 45,
            memoryUsage: 12.5,
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            code: 'def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]'
          },
          {
            _id: '2',
            problem: { title: 'Valid Parentheses', _id: 'prob2' },
            language: 'javascript',
            status: 'Runtime Error',
            executionTime: 0,
            memoryUsage: 0,
            submittedAt: new Date(Date.now() - 7200000).toISOString(),
            code: 'function isValid(s) {\n    const stack = [];\n    const mapping = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"};\n    \n    for (let char of s) {\n        if (char in mapping) {\n            if (!stack || stack.pop() !== mapping[char]) {\n                return false;\n            }\n        } else {\n            stack.push(char);\n        }\n    }\n    \n    return stack.length === 0;\n}'
          },
          {
            _id: '3',
            problem: { title: 'Binary Search', _id: 'prob3' },
            language: 'cpp',
            status: 'Accepted',
            executionTime: 12,
            memoryUsage: 8.2,
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            code: '#include <vector>\nusing namespace std;\n\nint search(vector<int>& nums, int target) {\n    int left = 0, right = nums.size() - 1;\n    \n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        \n        if (nums[mid] == target) {\n            return mid;\n        } else if (nums[mid] < target) {\n            left = mid + 1;\n        } else {\n            right = mid - 1;\n        }\n    }\n    \n    return -1;\n}'
          },
        ];
        
        setSubmissions(mockSubmissions);
      } catch (error) {
        enqueueSnackbar('Failed to load submissions', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [enqueueSnackbar]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircleIcon color="success" />;
      case 'Runtime Error':
      case 'Compilation Error':
        return <ErrorIcon color="error" />;
      default:
        return <ScheduleIcon color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'success';
      case 'Runtime Error':
      case 'Compilation Error':
        return 'error';
      case 'Time Limit Exceeded':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const handleViewCode = (submission) => {
    setSelectedSubmission(submission);
    setCodeDialogOpen(true);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const statusMatch = statusFilter === 'all' || submission.status === statusFilter;
    const languageMatch = languageFilter === 'all' || submission.language === languageFilter;
    return statusMatch && languageMatch;
  });

  if (loading) {
    return <LoadingSpinner text="Loading submissions..." fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>My Submissions - AgoUni Online Judge</title>
        <meta name="description" content="View your code submission history, track your progress, and analyze your solutions." />
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
            📝 My Submissions
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Track your coding progress and submission history
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FilterIcon color="action" />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Accepted">Accepted</MenuItem>
                <MenuItem value="Runtime Error">Runtime Error</MenuItem>
                <MenuItem value="Time Limit Exceeded">Time Limit Exceeded</MenuItem>
                <MenuItem value="Compilation Error">Compilation Error</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={languageFilter}
                label="Language"
                onChange={(e) => setLanguageFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="all">All Languages</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="java">Java</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {filteredSubmissions.length} submissions
            </Typography>
          </Box>
        </Paper>

        {/* Submissions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Problem</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Language</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Runtime</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Memory</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Submitted</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((submission, index) => (
                  <motion.tr
                    key={submission._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableRow hover>
                      <TableCell>
                        <Box 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => navigate(`/problem/${submission.problem._id}`)}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {submission.problem.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getStatusIcon(submission.status)}
                          <Chip
                            label={submission.status}
                            color={getStatusColor(submission.status)}
                            size="small"
                            sx={{ ml: 1, fontWeight: 500 }}
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Chip
                          label={submission.language.toUpperCase()}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {submission.executionTime > 0 ? `${submission.executionTime}ms` : 'N/A'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {submission.memoryUsage > 0 ? `${submission.memoryUsage.toFixed(1)}MB` : 'N/A'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(submission.submittedAt)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Code">
                            <IconButton
                              size="small"
                              onClick={() => handleViewCode(submission)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Share Solution">
                            <IconButton size="small" disabled>
                              <ShareIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        {filteredSubmissions.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center', mt: 3 }}>
            <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No submissions found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Start solving problems to see your submissions here
            </Typography>
            <Button
              variant="contained"
              startIcon={<CodeIcon />}
              onClick={() => navigate('/problems')}
            >
              Browse Problems
            </Button>
          </Paper>
        )}

        {/* Code View Dialog */}
        <Dialog
          open={codeDialogOpen}
          onClose={() => setCodeDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon />
              Solution for {selectedSubmission?.problem.title}
              <Chip
                label={selectedSubmission?.language.toUpperCase()}
                size="small"
                sx={{ ml: 'auto' }}
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedSubmission && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={getStatusIcon(selectedSubmission.status)}
                    label={selectedSubmission.status}
                    color={getStatusColor(selectedSubmission.status)}
                    size="small"
                  />
                  {selectedSubmission.executionTime > 0 && (
                    <Chip
                      label={`${selectedSubmission.executionTime}ms`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {selectedSubmission.memoryUsage > 0 && (
                    <Chip
                      label={`${selectedSubmission.memoryUsage.toFixed(1)}MB`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
                
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                  <CodeMirror
                    value={selectedSubmission.code}
                    height="400px"
                    theme={theme.palette.mode}
                    extensions={[languageExtensions[selectedSubmission.language] || javascript()]}
                    editable={false}
                    style={{ fontSize: '14px' }}
                  />
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCodeDialogOpen(false)}>
              Close
            </Button>
            <Button 
              variant="contained" 
              startIcon={<ShareIcon />}
              disabled
            >
              Share Solution
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Submissions;
