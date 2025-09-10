import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocalOffer as TagIcon,
  Category as CategoryIcon,
  Forum as ForumIcon,
  Clear as ClearIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';
import axiosInstance from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [favorites, setFavorites] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axiosInstance.get('/problems', { withCredentials: true });
        
        // Enhanced mock data with categories and tags
        const enhancedProblems = response.data.map(problem => ({
          ...problem,
          category: problem.category || ['Array', 'Hash Table', 'Dynamic Programming', 'Graph', 'Tree', 'String'][Math.floor(Math.random() * 6)],
          tags: problem.tags || [
            ['Array', 'Two Pointers'],
            ['Hash Table', 'String'],
            ['Dynamic Programming', 'Recursion'],
            ['Graph', 'DFS', 'BFS'],
            ['Tree', 'Binary Tree'],
            ['String', 'Pattern Matching']
          ][Math.floor(Math.random() * 6)],
          isFavorite: favorites.has(problem._id),
          discussionCount: Math.floor(Math.random() * 50),
        }));
        
        setProblems(enhancedProblems);
        
        // Extract unique categories and tags
        const uniqueCategories = [...new Set(enhancedProblems.map(p => p.category))];
        const allTags = enhancedProblems.flatMap(p => p.tags || []);
        const uniqueTags = [...new Set(allTags)];
        
        setCategories(uniqueCategories);
        setAvailableTags(uniqueTags);
        setLoading(false);
      } catch (error) {
        enqueueSnackbar(error.response?.data || 'Error fetching problems', { 
          variant: 'error' 
        });
        if (error.response?.status === 401) {
          navigate('/');
        }
        setLoading(false);
      }
    };

    fetchProblems();
  }, [navigate, enqueueSnackbar, favorites]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((term) => {
      setSearchTerm(term);
      setPage(0);
    }, 300),
    []
  );

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           problem.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (problem.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDifficulty = difficultyFilter === 'all' || 
                               problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'solved' && problem.userSolution) ||
                           (statusFilter === 'unsolved' && !problem.userSolution) ||
                           (statusFilter === 'favorites' && problem.isFavorite);
      
      const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => (problem.tags || []).includes(tag));
      
      return matchesSearch && matchesDifficulty && matchesStatus && matchesCategory && matchesTags;
    });
  }, [problems, searchTerm, difficultyFilter, statusFilter, categoryFilter, selectedTags]);

  const paginatedProblems = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredProblems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredProblems, page, rowsPerPage]);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'success',
      medium: 'warning', 
      hard: 'error',
    };
    return colors[difficulty?.toLowerCase()] || 'default';
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      setPage(0);
    }
  };

  const toggleFavorite = async (problemId, event) => {
    event.stopPropagation();
    try {
      const newFavorites = new Set(favorites);
      if (favorites.has(problemId)) {
        newFavorites.delete(problemId);
      } else {
        newFavorites.add(problemId);
      }
      setFavorites(newFavorites);
      
      // Update problems list
      setProblems(prev => prev.map(problem => 
        problem._id === problemId 
          ? { ...problem, isFavorite: newFavorites.has(problemId) }
          : problem
      ));
      
      enqueueSnackbar(
        newFavorites.has(problemId) ? 'Added to favorites' : 'Removed from favorites',
        { variant: 'success' }
      );
    } catch (error) {
      enqueueSnackbar('Failed to update favorites', { variant: 'error' });
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      setPage(0);
      return newTags;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSelectedTags([]);
    setPage(0);
  };

  const ProblemCard = ({ problem, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          }
        }}
        onClick={() => navigate(`/problem/${problem._id}`)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {problem.userSolution && (
              <CheckCircleIcon 
                color="success" 
                sx={{ mr: 1, fontSize: 20 }} 
              />
            )}
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {problem.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => toggleFavorite(problem._id, e)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                {problem.isFavorite ? (
                  <FavoriteIcon color="error" fontSize="small" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={problem.difficulty}
              color={getDifficultyColor(problem.difficulty)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
            <Chip
              label={problem.category}
              variant="outlined"
              size="small"
              icon={<CategoryIcon />}
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
            {problem.description?.substring(0, 120)}...
          </Typography>
          
          {/* Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2, minHeight: 24 }}>
            {(problem.tags || []).slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            ))}
            {(problem.tags?.length || 0) > 3 && (
              <Chip
                label={`+${(problem.tags?.length || 0) - 3} more`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Acceptance: {problem.acceptanceRate || 0}%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {problem.submissions || 0} submissions
              </Typography>
              {problem.discussionCount > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ForumIcon sx={{ fontSize: 12 }} color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {problem.discussionCount}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
        
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Button 
            size="small" 
            startIcon={<ForumIcon />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/problem/${problem._id}/discussion`);
            }}
          >
            Discuss
          </Button>
          <Button size="small" variant="contained">
            Solve
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );

  const ProblemRow = ({ problem, index }) => (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/problem/${problem._id}`)}
    >
      <TableRow hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {problem.userSolution && (
                <CheckCircleIcon 
                  color="success" 
                  sx={{ mr: 1, fontSize: 18 }} 
                />
              )}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {problem.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  {(problem.tags || []).slice(0, 2).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => toggleFavorite(problem._id, e)}
            >
              {problem.isFavorite ? (
                <FavoriteIcon color="error" fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={problem.difficulty}
            color={getDifficultyColor(problem.difficulty)}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={problem.category}
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2">
            {problem.acceptanceRate || 0}%
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2">
            {problem.submissions || 0}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              size="small"
              startIcon={<ForumIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/problem/${problem._id}/discussion`);
              }}
            >
              Discuss ({problem.discussionCount || 0})
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    </motion.tr>
  );

  if (loading) {
    return <LoadingSpinner text="Loading problems..." fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Problems - AgoUni Online Judge</title>
        <meta name="description" content="Browse and solve programming problems on AgoUni Online Judge. Practice algorithms, data structures, and competitive programming." />
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
            Problems
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Solve {filteredProblems.length} programming challenges
          </Typography>
        </Box>

        {/* Filters and Controls */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search problems, tags..."
                onChange={(e) => debouncedSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={difficultyFilter}
                  label="Difficulty"
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="solved">Solved</MenuItem>
                  <MenuItem value="unsolved">Unsolved</MenuItem>
                  <MenuItem value="favorites">⭐ Favorites</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                >
                  Clear
                </Button>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  size="small"
                >
                  <ToggleButton value="table">
                    <ViewListIcon />
                  </ToggleButton>
                  <ToggleButton value="cards">
                    <ViewModuleIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
            
            <Grid item xs={1}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredProblems.length} results
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TagIcon fontSize="small" />
                Popular Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableTags.slice(0, 12).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    clickable
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                    onClick={() => handleTagToggle(tag)}
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
                {selectedTags.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => setSelectedTags([])}
                    sx={{ ml: 1 }}
                  >
                    Clear Tags
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Problems List */}
        <AnimatePresence mode="wait">
          {viewMode === 'cards' ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Grid container spacing={3}>
                {paginatedProblems.map((problem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={problem._id}>
                    <ProblemCard problem={problem} index={index} />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Problem</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Difficulty</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Acceptance</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Submissions</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedProblems.map((problem, index) => (
                      <ProblemRow key={problem._id} problem={problem} index={index} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {filteredProblems.length > rowsPerPage && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  variant="outlined"
                >
                  Previous
                </Button>
                <Typography>
                  Page {page + 1} of {Math.ceil(filteredProblems.length / rowsPerPage)}
                </Typography>
                <Button
                  disabled={(page + 1) * rowsPerPage >= filteredProblems.length}
                  onClick={() => setPage(page + 1)}
                  variant="outlined"
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {filteredProblems.length === 0 && !loading && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No problems found
            </Typography>
            <Typography color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
}

export default ProblemsList;
