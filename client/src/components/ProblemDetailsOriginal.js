import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axiosInstance from '../utils/axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import Split from 'react-split';
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
  Divider,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import LoadingSpinner from './common/LoadingSpinner';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [output, setOutput] = useState({
    status: '',
    stdout: '',
    stderr: '',
    executionTime: 0,
    testResults: [],
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
          const response = await axiosInstance.get(`/problems/${id}`, { withCredentials: true });
          console.log(response.data);
  
          setProblem(response.data.problem);
  
          if (response.data.userSolution) {
              setLanguage(response.data.userSolution.language); // First, set language
              setCode(response.data.userSolution.code); // Then, set code
          } else {
              setCode(defaultCode[language]);
          }
  
          setLoading(false);
      } catch (error) {
          enqueueSnackbar(error.response?.data || 'Error fetching problem', { variant: 'error' });
          if (error.response?.status === 401) {
              navigate('/');
          }
      }
    };
  
    fetchProblem();
  }, [id, navigate, enqueueSnackbar]);

  useEffect(() => {
    if (!problem?.userSolution) {
      setCode(defaultCode[language]); // Update only if no previous solution
    }
  }, [language]);

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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'success',
      medium: 'warning', 
      hard: 'error',
    };
    return colors[difficulty?.toLowerCase()] || 'default';
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return <LoadingSpinner text="Loading problem..." fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{problem?.title} - AgoUni Online Judge</title>
        <meta name="description" content={`Solve ${problem?.title} - ${problem?.difficulty} difficulty programming problem on AgoUni Online Judge.`} />
      </Helmet>
      
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {submitting && (
          <LinearProgress 
            variant="indeterminate" 
            sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}
          />
        )}
        
        {isMobile ? (
          // Mobile Layout
          <Container maxWidth="xl" sx={{ py: 2, height: '100vh' }}>
            <Box sx={{ mb: 2 }}>
              <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                <Tab label="Problem" />
                <Tab label="Code" />
                <Tab label="Output" disabled={!output.status} />
              </Tabs>
            </Box>
            
            <TabPanel value={activeTab} index={0}>
              <Card sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    {problem?.userSolution && (
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="h4" sx={{ flexGrow: 1 }}>
                      {problem.title}
                    </Typography>
                    <Chip
                      label={problem.difficulty}
                      color={getDifficultyColor(problem.difficulty)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      label={`Acceptance: ${problem.acceptanceRate || 0}%`}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${problem.submissions || 0} submissions`}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                    {problem.description}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Example:
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                      fontFamily: 'monospace',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {problem.example}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              {/* Mobile Code Editor */}
              <Box sx={{ height: 'calc(100vh - 200px)' }}>
                <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={language}
                      label="Language"
                      onChange={handleLanguageChange}
                      size="small"
                    >
                      <MenuItem value="python">Python</MenuItem>
                      <MenuItem value="javascript">JavaScript</MenuItem>
                      <MenuItem value="cpp">C++</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    onClick={handleRun}
                    disabled={submitting}
                    startIcon={submitting ? null : <PlayArrowIcon />}
                    size="small"
                  >
                    {submitting ? 'Running...' : 'Run'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? null : <SendIcon />}
                    size="small"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </Box>
                
                <Paper sx={{ height: 'calc(100% - 80px)' }}>
                  <CodeMirror
                    key={`${id}-${language}-mobile`}
                    value={code}
                    height="100%"
                    theme={theme.palette.mode}
                    extensions={[languageExtensions[language]]}
                    onChange={(value) => setCode(value)}
                    style={{ fontSize: '14px' }}
                  />
                </Paper>
              </Box>
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              {output.status && (
                <Box sx={{ height: 'calc(100vh - 200px)' }}>
                  <Alert 
                    severity={output.status === 'success' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  >
                    {output.status === 'success' ? 'Code executed successfully!' : 'Execution failed'}
                    <Chip 
                      label={`${output.executionTime}ms`} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Alert>
                  
                  {output.stdout && (
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="success.main">
                          Output:
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            bgcolor: 'success.light',
                            color: 'success.contrastText',
                            fontFamily: 'monospace',
                            maxHeight: '300px',
                            overflow: 'auto',
                          }}
                        >
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {output.stdout}
                          </pre>
                        </Paper>
                      </CardContent>
                    </Card>
                  )}
                  
                  {output.stderr && (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="error.main">
                          Error:
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                            fontFamily: 'monospace',
                            maxHeight: '300px',
                            overflow: 'auto',
                          }}
                        >
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {output.stderr}
                          </pre>
                        </Paper>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}
            </TabPanel>
          </Container>
        ) : (
          // Desktop Split Layout
          <Box sx={{ height: '100vh', overflow: 'hidden' }}>
            <Split
              sizes={[40, 60]}
              minSize={300}
              expandToMin={false}
              gutterSize={10}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              direction="horizontal"
              cursor="col-resize"
              style={{ height: '100%', display: 'flex' }}
            >
              {/* Problem Description Panel */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%', overflow: 'hidden' }}
              >
                <Paper 
                  elevation={0} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 0,
                    borderRight: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      {problem?.userSolution && (
                        <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 24 }} />
                      )}
                      <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        {problem.title}
                      </Typography>
                      <Chip
                        label={problem.difficulty}
                        color={getDifficultyColor(problem.difficulty)}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Chip
                        label={`Acceptance: ${problem.acceptanceRate || 0}%`}
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${problem.submissions || 0} submissions`}
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                      {problem.description}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
                      Example:
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {problem.example}
                      </pre>
                    </Paper>
                  </Box>
                </Paper>
              </motion.div>
              
              {/* Code Editor Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <Paper 
                  elevation={0} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Editor Toolbar */}
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center',
                    minHeight: '64px',
                  }}>
                    <FormControl sx={{ minWidth: 140 }}>
                      <InputLabel size="small">Language</InputLabel>
                      <Select
                        value={language}
                        label="Language"
                        onChange={handleLanguageChange}
                        size="small"
                      >
                        <MenuItem value="python">Python</MenuItem>
                        <MenuItem value="javascript">JavaScript</MenuItem>
                        <MenuItem value="cpp">C++</MenuItem>
                        <MenuItem value="java">Java</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {problem?.userSolution && (
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label="Previously Solved"
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    
                    <Box sx={{ flexGrow: 1 }} />
                    
                    <Tooltip title="Save code">
                      <IconButton size="small">
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Button
                      variant="outlined"
                      onClick={handleRun}
                      disabled={submitting}
                      startIcon={submitting ? null : <PlayArrowIcon />}
                      size="small"
                    >
                      {submitting ? 'Running...' : 'Run'}
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={submitting}
                      startIcon={submitting ? null : <SendIcon />}
                      size="small"
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </Box>
                  
                  {/* Code Editor */}
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <CodeMirror
                      key={`${id}-${language}-desktop`}
                      value={code}
                      height="100%"
                      theme={theme.palette.mode}
                      extensions={[languageExtensions[language]]}
                      onChange={(value) => setCode(value)}
                      style={{ 
                        fontSize: '14px',
                        height: '100%',
                      }}
                    />
                  </Box>
                  
                  {/* Output Panel */}
                  {output.status && (
                    <Box sx={{ 
                      borderTop: `1px solid ${theme.palette.divider}`,
                      maxHeight: '40%',
                      overflow: 'auto',
                    }}>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Output
                          </Typography>
                          <Chip
                            icon={output.status === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                            label={output.status === 'success' ? 'Success' : 'Error'}
                            color={output.status === 'success' ? 'success' : 'error'}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={`${output.executionTime}ms`}
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                        
                        {output.stdout && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              mb: 2,
                              bgcolor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light',
                              color: 'success.contrastText',
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              maxHeight: '200px',
                              overflow: 'auto',
                            }}
                          >
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {output.stdout}
                            </pre>
                          </Paper>
                        )}
                        
                        {output.stderr && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              bgcolor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.light',
                              color: 'error.contrastText',
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              maxHeight: '200px',
                              overflow: 'auto',
                            }}
                          >
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {output.stderr}
                            </pre>
                          </Paper>
                        )}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Split>
          </Box>
        )}
      </Box>
    </>
  );
}

export default ProblemDetails;
