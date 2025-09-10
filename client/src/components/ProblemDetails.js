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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Menu,
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
  Code as CodeIcon,
  Snippet as SnippetIcon,
  InsertDriveFile as TemplateIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as TestIcon,
  Timer as TimerIcon,
  Memory as MemoryIcon,
  Settings as SettingsIcon,
  Lightbulb as HintIcon,
  Forum as DiscussionIcon,
  Share as ShareIcon,
  Restore as RestoreIcon,
  History as HistoryIcon,
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

const codeTemplates = {
  javascript: {
    basic: '// Write your JavaScript code here\nfunction solve() {\n    // Your solution here\n}\n\n// Example usage:\n// console.log(solve());\n',
    array: '// Array problem template\nfunction solve(arr) {\n    // Process the array\n    for (let i = 0; i < arr.length; i++) {\n        // Your logic here\n    }\n    return result;\n}\n',
    twoPointers: '// Two pointers technique\nfunction solve(arr) {\n    let left = 0, right = arr.length - 1;\n    \n    while (left < right) {\n        // Your logic here\n        if (condition) {\n            left++;\n        } else {\n            right--;\n        }\n    }\n    \n    return result;\n}\n',
    dp: '// Dynamic Programming template\nfunction solve(n) {\n    const dp = new Array(n + 1).fill(0);\n    dp[0] = baseCase;\n    \n    for (let i = 1; i <= n; i++) {\n        // dp[i] = recurrence relation\n    }\n    \n    return dp[n];\n}\n',
  },
  python: {
    basic: '# Write your Python code here\ndef solve():\n    # Your solution here\n    pass\n\n# Example usage:\n# print(solve())\n',
    array: '# Array problem template\ndef solve(arr):\n    # Process the array\n    for i in range(len(arr)):\n        # Your logic here\n        pass\n    return result\n',
    twoPointers: '# Two pointers technique\ndef solve(arr):\n    left, right = 0, len(arr) - 1\n    \n    while left < right:\n        # Your logic here\n        if condition:\n            left += 1\n        else:\n            right -= 1\n    \n    return result\n',
    dp: '# Dynamic Programming template\ndef solve(n):\n    dp = [0] * (n + 1)\n    dp[0] = base_case\n    \n    for i in range(1, n + 1):\n        # dp[i] = recurrence relation\n        pass\n    \n    return dp[n]\n',
  },
  cpp: {
    basic: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\n// Write your C++ code here\nint solve() {\n    // Your solution here\n    return 0;\n}\n\nint main() {\n    cout << solve() << endl;\n    return 0;\n}\n',
    array: '#include <iostream>\n#include <vector>\nusing namespace std;\n\n// Array problem template\nvector<int> solve(vector<int>& arr) {\n    // Process the array\n    for (int i = 0; i < arr.size(); i++) {\n        // Your logic here\n    }\n    return result;\n}\n\nint main() {\n    // Your code here\n    return 0;\n}\n',
    twoPointers: '#include <iostream>\n#include <vector>\nusing namespace std;\n\n// Two pointers technique\nint solve(vector<int>& arr) {\n    int left = 0, right = arr.size() - 1;\n    \n    while (left < right) {\n        // Your logic here\n        if (condition) {\n            left++;\n        } else {\n            right--;\n        }\n    }\n    \n    return result;\n}\n\nint main() {\n    // Your code here\n    return 0;\n}\n',
  },
  java: {
    basic: 'public class Solution {\n    // Write your Java code here\n    public static int solve() {\n        // Your solution here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(solve());\n    }\n}\n',
    array: 'import java.util.*;\n\npublic class Solution {\n    // Array problem template\n    public static int[] solve(int[] arr) {\n        // Process the array\n        for (int i = 0; i < arr.length; i++) {\n            // Your logic here\n        }\n        return result;\n    }\n    \n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n',
  }
};

const codeSnippets = {
  javascript: [
    { name: 'For Loop', code: 'for (let i = 0; i < n; i++) {\n    // code\n}' },
    { name: 'While Loop', code: 'while (condition) {\n    // code\n}' },
    { name: 'Binary Search', code: 'let left = 0, right = arr.length - 1;\nwhile (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n}\nreturn -1;' },
    { name: 'DFS', code: 'function dfs(node, visited) {\n    if (visited.has(node)) return;\n    visited.add(node);\n    \n    // Process node\n    \n    for (let neighbor of graph[node]) {\n        dfs(neighbor, visited);\n    }\n}' },
    { name: 'BFS', code: 'function bfs(start) {\n    const queue = [start];\n    const visited = new Set([start]);\n    \n    while (queue.length > 0) {\n        const node = queue.shift();\n        // Process node\n        \n        for (let neighbor of graph[node]) {\n            if (!visited.has(neighbor)) {\n                visited.add(neighbor);\n                queue.push(neighbor);\n            }\n        }\n    }\n}' },
  ],
  python: [
    { name: 'For Loop', code: 'for i in range(n):\n    # code' },
    { name: 'While Loop', code: 'while condition:\n    # code' },
    { name: 'Binary Search', code: 'left, right = 0, len(arr) - 1\nwhile left <= right:\n    mid = (left + right) // 2\n    if arr[mid] == target:\n        return mid\n    elif arr[mid] < target:\n        left = mid + 1\n    else:\n        right = mid - 1\nreturn -1' },
    { name: 'DFS', code: 'def dfs(node, visited):\n    if node in visited:\n        return\n    visited.add(node)\n    \n    # Process node\n    \n    for neighbor in graph[node]:\n        dfs(neighbor, visited)' },
  ],
  cpp: [
    { name: 'For Loop', code: 'for (int i = 0; i < n; i++) {\n    // code\n}' },
    { name: 'While Loop', code: 'while (condition) {\n    // code\n}' },
    { name: 'Binary Search', code: 'int left = 0, right = arr.size() - 1;\nwhile (left <= right) {\n    int mid = left + (right - left) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n}\nreturn -1;' },
  ],
  java: [
    { name: 'For Loop', code: 'for (int i = 0; i < n; i++) {\n    // code\n}' },
    { name: 'While Loop', code: 'while (condition) {\n    // code\n}' },
    { name: 'Binary Search', code: 'int left = 0, right = arr.length - 1;\nwhile (left <= right) {\n    int mid = left + (right - left) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n}\nreturn -1;' },
  ]
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
    memoryUsage: 0,
    testResults: [],
  });
  
  // Enhanced features state
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [snippetsOpen, setSnippetsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customTestOpen, setCustomTestOpen] = useState(false);
  const [codeHistory, setCodeHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 4,
    wordWrap: false,
    lineNumbers: true,
    autoSave: true,
  });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
          const response = await axiosInstance.get(`/problems/${id}`, { withCredentials: true });
          console.log(response.data);
  
          setProblem(response.data.problem);
  
          if (response.data.userSolution) {
              setLanguage(response.data.userSolution.language);
              setCode(response.data.userSolution.code);
          } else {
              setCode(codeTemplates[language]?.basic || '// Write your code here\n');
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
      setCode(codeTemplates[language]?.basic || '// Write your code here\n');
    }
  }, [language, problem]);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    if (code !== codeTemplates[language]?.basic) {
      // Save current code to history
      const historyEntry = {
        timestamp: new Date().toISOString(),
        language,
        code,
      };
      setCodeHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
    }
    
    setLanguage(newLanguage);
    if (!code || code === codeTemplates[language]?.basic) {
      setCode(codeTemplates[newLanguage]?.basic || '// Write your code here\n');
    }
  };

  const handleTemplateSelect = (templateKey) => {
    const template = codeTemplates[language]?.[templateKey];
    if (template) {
      setCode(template);
      setTemplatesOpen(false);
      enqueueSnackbar('Template applied successfully', { variant: 'success' });
    }
  };

  const handleSnippetInsert = (snippet) => {
    const cursorPos = code.length; // Simple insertion at end for now
    const newCode = code + '\n\n' + snippet.code + '\n';
    setCode(newCode);
    setSnippetsOpen(false);
    enqueueSnackbar('Snippet inserted successfully', { variant: 'success' });
  };

  const handleCustomTest = async () => {
    try {
      setSubmitting(true);
      const response = await axiosInstance.post(`/problems/${id}/test`, {
        code,
        language,
        input: customInput,
      });
      setOutput({
        ...response.data,
        testResults: response.data.testResults || [],
      });
      setCustomTestOpen(false);
      enqueueSnackbar('Custom test executed', { variant: 'success' });
    } catch (error) {
      setOutput({
        status: 'error',
        stdout: '',
        stderr: error.response?.data?.error || 'Test execution failed',
        executionTime: 0,
        memoryUsage: 0,
        testResults: [],
      });
      enqueueSnackbar('Custom test failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRun = async () => {
    try {
      setSubmitting(true);
      const response = await axiosInstance.post(`/problems/${id}/run`, {
        code,
        language,
      });
      setOutput({
        ...response.data,
        testResults: response.data.testResults || [],
      });
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
        memoryUsage: 0,
        testResults: [],
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
      setOutput({
        ...response.data,
        testResults: response.data.testResults || [],
      });
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
        memoryUsage: 0,
        testResults: [],
      });
      enqueueSnackbar('Submission failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreCode = (historyItem) => {
    setCode(historyItem.code);
    setLanguage(historyItem.language);
    setHistoryOpen(false);
    enqueueSnackbar('Code restored from history', { variant: 'success' });
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

  const EnhancedEditorToolbar = () => (
    <Box sx={{ 
      p: 2, 
      borderBottom: `1px solid ${theme.palette.divider}`,
      display: 'flex', 
      gap: 1, 
      alignItems: 'center',
      minHeight: '64px',
      flexWrap: 'wrap',
    }}>
      <FormControl sx={{ minWidth: 120 }}>
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
      
      <Tooltip title="Code Templates">
        <IconButton size="small" onClick={() => setTemplatesOpen(true)}>
          <Badge badgeContent={Object.keys(codeTemplates[language] || {}).length} color="primary">
            <TemplateIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Code Snippets">
        <IconButton size="small" onClick={() => setSnippetsOpen(true)}>
          <Badge badgeContent={codeSnippets[language]?.length || 0} color="primary">
            <SnippetIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Code History">
        <IconButton size="small" onClick={() => setHistoryOpen(true)}>
          <Badge badgeContent={codeHistory.length} color="primary">
            <HistoryIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Custom Test">
        <IconButton size="small" onClick={() => setCustomTestOpen(true)}>
          <TestIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Settings">
        <IconButton size="small" onClick={() => setSettingsOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Discussion">
        <IconButton size="small" onClick={() => navigate(`/problem/${id}/discussion`)}>
          <DiscussionIcon />
        </IconButton>
      </Tooltip>
      
      <Button
        variant="outlined"
        onClick={handleRun}
        disabled={submitting}
        startIcon={submitting ? <TimerIcon /> : <PlayArrowIcon />}
        size="small"
      >
        {submitting ? 'Running...' : 'Run'}
      </Button>
      
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={submitting}
        startIcon={submitting ? <TimerIcon /> : <SendIcon />}
        size="small"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </Button>
    </Box>
  );

  const EnhancedOutputPanel = () => (
    output.status && (
      <Box sx={{ 
        borderTop: `1px solid ${theme.palette.divider}`,
        maxHeight: '40%',
        overflow: 'auto',
      }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Test Results
            </Typography>
            <Chip
              icon={output.status === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
              label={output.status === 'success' ? 'All Tests Passed' : 'Tests Failed'}
              color={output.status === 'success' ? 'success' : 'error'}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              icon={<TimerIcon />}
              label={`${output.executionTime}ms`}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              icon={<MemoryIcon />}
              label={`${output.memoryUsage || 0}MB`}
              variant="outlined"
              size="small"
            />
          </Box>
          
          {/* Test Results */}
          {output.testResults && output.testResults.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Test Cases:
              </Typography>
              {output.testResults.map((test, index) => (
                <Accordion key={index} variant="outlined">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={test.passed ? <CheckCircleIcon /> : <ErrorIcon />}
                        label={`Test ${index + 1}`}
                        color={test.passed ? 'success' : 'error'}
                        size="small"
                      />
                      <Typography variant="body2">
                        {test.passed ? 'Passed' : 'Failed'}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Input:</Typography>
                        <Paper sx={{ p: 1, bgcolor: 'grey.100', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{test.input}</pre>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Expected:</Typography>
                        <Paper sx={{ p: 1, bgcolor: 'grey.100', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{test.expected}</pre>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Your Output:</Typography>
                        <Paper sx={{ 
                          p: 1, 
                          bgcolor: test.passed ? 'success.light' : 'error.light', 
                          fontFamily: 'monospace', 
                          fontSize: '0.8rem' 
                        }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{test.actual}</pre>
                        </Paper>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
          
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Output:</Typography>
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Error:</Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {output.stderr}
              </pre>
            </Paper>
          )}
        </Box>
      </Box>
    )
  );

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
          // Mobile Layout (unchanged for brevity, but would include similar enhancements)
          <Container maxWidth="xl" sx={{ py: 2, height: '100vh' }}>
            <Box sx={{ mb: 2 }}>
              <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                <Tab label="Problem" />
                <Tab label="Code" />
                <Tab label="Output" disabled={!output.status} />
              </Tabs>
            </Box>
            
            <TabPanel value={activeTab} index={0}>
              {/* Problem panel content */}
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
              <Box sx={{ height: 'calc(100vh - 200px)' }}>
                <EnhancedEditorToolbar />
                <Paper sx={{ height: 'calc(100% - 80px)' }}>
                  <CodeMirror
                    key={`${id}-${language}-mobile`}
                    value={code}
                    height="100%"
                    theme={theme.palette.mode}
                    extensions={[languageExtensions[language]]}
                    onChange={(value) => setCode(value)}
                    style={{ fontSize: `${editorSettings.fontSize}px` }}
                  />
                </Paper>
              </Box>
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <EnhancedOutputPanel />
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

                    {/* Quick Actions */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Quick Actions:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          startIcon={<HintIcon />}
                          variant="outlined"
                          onClick={() => enqueueSnackbar('Hints coming soon!', { variant: 'info' })}
                        >
                          Hints
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DiscussionIcon />}
                          variant="outlined"
                          onClick={() => navigate(`/problem/${id}/discussion`)}
                        >
                          Discuss
                        </Button>
                        <Button
                          size="small"
                          startIcon={<ShareIcon />}
                          variant="outlined"
                          onClick={() => enqueueSnackbar('Link copied to clipboard!', { variant: 'success' })}
                        >
                          Share
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
              
              {/* Enhanced Code Editor Panel */}
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
                  <EnhancedEditorToolbar />
                  
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
                        fontSize: `${editorSettings.fontSize}px`,
                        height: '100%',
                      }}
                    />
                  </Box>
                  
                  <EnhancedOutputPanel />
                </Paper>
              </motion.div>
            </Split>
          </Box>
        )}

        {/* Templates Dialog */}
        <Dialog open={templatesOpen} onClose={() => setTemplatesOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Code Templates</DialogTitle>
          <DialogContent>
            <List>
              {Object.entries(codeTemplates[language] || {}).map(([key, template]) => (
                <ListItem key={key} disablePadding>
                  <ListItemButton onClick={() => handleTemplateSelect(key)}>
                    <ListItemText 
                      primary={key.charAt(0).toUpperCase() + key.slice(1)} 
                      secondary={template.split('\n')[0].replace(/^\/\/|^#/, '').trim()}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* Snippets Dialog */}
        <Dialog open={snippetsOpen} onClose={() => setSnippetsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Code Snippets</DialogTitle>
          <DialogContent>
            <List>
              {(codeSnippets[language] || []).map((snippet, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleSnippetInsert(snippet)}>
                    <ListItemText 
                      primary={snippet.name} 
                      secondary={snippet.code.split('\n')[0]}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* Custom Test Dialog */}
        <Dialog open={customTestOpen} onClose={() => setCustomTestOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Custom Test Case</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Custom Input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter your test input here..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomTestOpen(false)}>Cancel</Button>
            <Button onClick={handleCustomTest} variant="contained">Run Test</Button>
          </DialogActions>
        </Dialog>

        {/* Code History Dialog */}
        <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Code History</DialogTitle>
          <DialogContent>
            <List>
              {codeHistory.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleRestoreCode(item)}>
                    <ListItemText 
                      primary={`${item.language} - ${new Date(item.timestamp).toLocaleString()}`}
                      secondary={item.code.split('\n')[0].substring(0, 50) + '...'}
                    />
                    <IconButton onClick={() => handleRestoreCode(item)}>
                      <RestoreIcon />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}
              {codeHistory.length === 0 && (
                <ListItem>
                  <ListItemText primary="No code history available" />
                </ListItem>
              )}
            </List>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Font Size"
                value={editorSettings.fontSize}
                onChange={(e) => setEditorSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 10, max: 24 } }}
              />
              <TextField
                fullWidth
                type="number"
                label="Tab Size"
                value={editorSettings.tabSize}
                onChange={(e) => setEditorSettings(prev => ({ ...prev, tabSize: parseInt(e.target.value) }))}
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 2, max: 8 } }}
              />
              {/* Add more settings as needed */}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default ProblemDetails;
