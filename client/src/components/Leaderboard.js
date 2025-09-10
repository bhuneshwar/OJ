import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
    Container, 
    Paper, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Chip, 
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    LinearProgress,
    useTheme,
    Alert,
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    Speed as SpeedIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/leaderboard', { withCredentials: true });
                setLeaderboard(response.data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                setError('Failed to load leaderboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return '#CD7F32';
        return theme.palette.primary.main;
    };

    const getProgressColor = (solved, maxSolved) => {
        const percentage = (solved / maxSolved) * 100;
        if (percentage >= 80) return 'success';
        if (percentage >= 50) return 'info';
        if (percentage >= 25) return 'warning';
        return 'error';
    };

    const maxSolved = leaderboard.length > 0 ? Math.max(...leaderboard.map(user => user.problemsSolved)) : 0;
    const avgSolved = leaderboard.length > 0 ? leaderboard.reduce((sum, user) => sum + user.problemsSolved, 0) / leaderboard.length : 0;
    const totalUsers = leaderboard.length;

    if (loading) {
        return <LoadingSpinner text="Loading leaderboard..." fullScreen />;
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <>
            <Helmet>
                <title>Leaderboard - AgoUni Online Judge</title>
                <meta name="description" content="View the top performers on AgoUni Online Judge. See rankings, problem solving statistics, and competitive programming achievements." />
            </Helmet>
            
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ 
                        mb: 1,
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        🏆 Leaderboard
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Top performers and competitive programming champions
                    </Typography>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <TrophyIcon sx={{ mr: 1, fontSize: 28 }} />
                                        <Typography variant="h6">Total Users</Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        {totalUsers}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Active competitors
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <AssessmentIcon sx={{ mr: 1, fontSize: 28 }} />
                                        <Typography variant="h6">Max Solved</Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        {maxSolved}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Highest achievement
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <TrendingUpIcon sx={{ mr: 1, fontSize: 28 }} />
                                        <Typography variant="h6">Average</Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        {avgSolved.toFixed(1)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Problems solved
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                color: 'white',
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <SpeedIcon sx={{ mr: 1, fontSize: 28 }} />
                                        <Typography variant="h6">Best Time</Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        {leaderboard[0]?.bestTime || 0}ms
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Fastest solution
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* Leaderboard Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Paper elevation={2} sx={{ borderRadius: 3 }}>
                        <TableContainer sx={{ maxHeight: 700 }}>
                            <Table stickyHeader aria-label="leaderboard table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ 
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                        }}>
                                            Rank
                                        </TableCell>
                                        <TableCell sx={{ 
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                        }}>
                                            User
                                        </TableCell>
                                        <TableCell sx={{ 
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                        }}>
                                            Problems Solved
                                        </TableCell>
                                        <TableCell sx={{ 
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                        }}>
                                            Progress
                                        </TableCell>
                                        <TableCell sx={{ 
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                        }}>
                                            Best Time
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {leaderboard.map((user, index) => {
                                        const rank = index + 1;
                                        const progressPercentage = (user.problemsSolved / maxSolved) * 100;
                                        
                                        return (
                                            <motion.tr
                                                key={user.username}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                            >
                                                <TableRow
                                                    sx={{ 
                                                        '&:hover': { 
                                                            bgcolor: 'action.hover',
                                                            transform: 'scale(1.01)',
                                                        },
                                                        transition: 'all 0.2s ease-in-out',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar 
                                                                sx={{ 
                                                                    width: 40,
                                                                    height: 40,
                                                                    mr: 2,
                                                                    bgcolor: getRankColor(rank),
                                                                    fontSize: rank <= 3 ? '1.2rem' : '1rem',
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {getRankIcon(rank)}
                                                            </Avatar>
                                                        </Box>
                                                    </TableCell>
                                                    
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ 
                                                                fontWeight: 600,
                                                                color: rank <= 3 ? getRankColor(rank) : 'text.primary'
                                                            }}>
                                                                {user.username}
                                                            </Typography>
                                                            {rank <= 3 && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {rank === 1 ? 'Champion' : rank === 2 ? 'Runner-up' : 'Third Place'}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Chip
                                                                label={user.problemsSolved}
                                                                color={getProgressColor(user.problemsSolved, maxSolved)}
                                                                sx={{ 
                                                                    fontWeight: 700,
                                                                    minWidth: 50,
                                                                }}
                                                            />
                                                            <Typography variant="body2" color="text.secondary">
                                                                problems
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    
                                                    <TableCell>
                                                        <Box sx={{ width: '100%', mr: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                                                                    {progressPercentage.toFixed(1)}%
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress 
                                                                variant="determinate" 
                                                                value={progressPercentage}
                                                                color={getProgressColor(user.problemsSolved, maxSolved)}
                                                                sx={{ height: 8, borderRadius: 4 }}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    
                                                    <TableCell>
                                                        <Chip
                                                            label={`${user.bestTime}ms`}
                                                            variant="outlined"
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                fontWeight: 600,
                                                                minWidth: 80,
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </motion.tr>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        
                        {leaderboard.length === 0 && (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <TrophyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h5" gutterBottom>
                                    No rankings yet
                                </Typography>
                                <Typography color="text.secondary">
                                    Start solving problems to appear on the leaderboard!
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </motion.div>
            </Container>
        </>
    );
};

export default Leaderboard;
