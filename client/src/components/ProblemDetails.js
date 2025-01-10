import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';
import Navbar from './Navbar';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  cpp: cpp(),
  java: java(),
};

const defaultCode = {
  javascript: '// Write your JavaScript code here\n\n',
  python: '# Write your Python code here\n\n',
  cpp: '// Write your C++ code here\n\n',
  java: '// Write your Java code here\n\n',
};

function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState({
    status: '',
    stdout: '',
    stderr: '',
    executionTime: 0,
  });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axiosInstance.get(`/problems/${id}`);
        setProblem(response.data);
        
        // If user has a previous solution, load it
        if (response.data.userSolution) {
          setCode(response.data.userSolution.code);
          setLanguage(response.data.userSolution.language);
        } else {
          setCode(defaultCode[language]);
        }
        
        setLoading(false);
      } catch (error) {
        enqueueSnackbar(error.response?.data || 'Error fetching problem', { 
          variant: 'error' 
        });
        if (error.response?.status === 401) {
          navigate('/');
        }
      }
    };

    fetchProblem();
  }, [id, language, navigate, enqueueSnackbar]);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    // Only set default code if there's no existing code
    if (!code || code === defaultCode[language]) {
      setCode(defaultCode[newLanguage]);
    }
  };

  const handleRun = async () => {
    try {
      setSubmitting(true);
      const response = await axiosInstance.post(`/problems/${id}/run`, {
        code,
        language,
      });
      setOutput(response.data);
      if (response.data.status === 'success') {
        enqueueSnackbar('Code executed successfully', { variant: 'success' });
      } else {
        enqueueSnackbar('Code execution failed', { variant: 'error' });
      }
    } catch (error) {
      setOutput({
        status: 'error',
        stdout: '',
        stderr: error.response?.data?.error || 'Execution failed',
        executionTime: 0,
      });
      enqueueSnackbar('Code execution failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await axiosInstance.post(`/problems/${id}/submit`, {
        code,
        language,
      });
      setOutput(response.data);
      if (response.data.status === 'success') {
        enqueueSnackbar('Solution submitted successfully', { variant: 'success' });
      } else {
        enqueueSnackbar('Solution failed', { variant: 'error' });
      }
    } catch (error) {
      setOutput({
        status: 'error',
        stdout: '',
        stderr: error.response?.data?.error || 'Submission failed',
        executionTime: 0,
      });
      enqueueSnackbar('Submission failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2}>
          {/* Problem Description */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: '85vh', overflow: 'auto' }}>
              <Typography variant="h4" gutterBottom>
                {problem.title}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={problem.difficulty}
                  color={
                    problem.difficulty.toLowerCase() === 'easy'
                      ? 'success'
                      : problem.difficulty.toLowerCase() === 'medium'
                      ? 'warning'
                      : 'error'
                  }
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`Acceptance: ${problem.acceptanceRate || 0}%`}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {problem.description}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Example:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {problem.example}
                </Typography>
              </Paper>
            </Paper>
          </Grid>

          {/* Code Editor */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, height: '85vh', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={language}
                    label="Language"
                    onChange={handleLanguageChange}
                  >
                    <MenuItem value="python">Python</MenuItem>
                    <MenuItem value="javascript">JavaScript</MenuItem>
                    <MenuItem value="cpp">C++</MenuItem>
                    <MenuItem value="java">Java</MenuItem>
                  </Select>
                </FormControl>
                {problem?.userSolution && (
                  <Chip 
                    label="Previously Solved"
                    color="success"
                    variant="outlined"
                  />
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRun}
                  disabled={submitting}
                  startIcon={<PlayArrowIcon />}
                >
                  Run
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  startIcon={<SendIcon />}
                >
                  Submit
                </Button>
              </Box>

              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <CodeMirror
                  value={code}
                  height="100%"
                  theme="dark"
                  extensions={[languageExtensions[language]]}
                  onChange={(value) => setCode(value)}
                  style={{ fontSize: '14px' }}
                />
              </Box>

              {output.status && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Output
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={output.status === 'success' ? 'Success' : 'Error'}
                        color={output.status === 'success' ? 'success' : 'error'}
                        size="small"
                      />
                      <Chip
                        label={`${output.executionTime}ms`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                  {output.stdout && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: '#f5f5f5',
                        mb: 2,
                        maxHeight: '150px',
                        overflow: 'auto',
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{ margin: 0, color: 'success.main' }}
                      >
                        {output.stdout}
                      </Typography>
                    </Paper>
                  )}
                  {output.stderr && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: '#fee',
                        maxHeight: '150px',
                        overflow: 'auto',
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{ margin: 0, color: 'error.main' }}
                      >
                        {output.stderr}
                      </Typography>
                    </Paper>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default ProblemDetails;
