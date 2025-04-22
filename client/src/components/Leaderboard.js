import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { 
    Container, Paper, Typography, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, Box 
} from '@mui/material';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('/leaderboard', { withCredentials: true });
                setLeaderboard(response.data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ 
                p: 3, 
                borderRadius: 4,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(145deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 700,
                        color: 'primary.main',
                        textAlign: 'center',
                        mb: 4,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    Leaderboard
                </Typography>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ 
                                    fontWeight: 700,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    borderTopLeftRadius: 12
                                }}>
                                    Rank
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    fontSize: '1.1rem'
                                }}>
                                    Username
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    fontSize: '1.1rem'
                                }}>
                                    Solved
                                </TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 700,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    borderTopRightRadius: 12
                                }}>
                                    Best Time
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.map((user, index) => (
                                <TableRow 
                                    key={user.username}
                                    sx={{ 
                                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                        '&:hover': { backgroundColor: 'action.selected' },
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        <Chip 
                                            label={`#${index + 1}`} 
                                            color="primary" 
                                            sx={{ 
                                                fontWeight: 700,
                                                width: 60,
                                                borderRadius: 1
                                            }} 
                                        />
                                    </TableCell>
                                    <TableCell sx={{ 
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        color: 'text.primary'
                                    }}>
                                        {user.username}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Chip
                                                label={user.problemsSolved}
                                                color="success"
                                                sx={{ 
                                                    fontWeight: 600,
                                                    minWidth: 40,
                                                    borderRadius: 1
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                problems
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${user.bestTime}ms`}
                                            color="info"
                                            sx={{
                                                fontWeight: 600,
                                                fontFamily: 'monospace',
                                                minWidth: 80,
                                                borderRadius: 1
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default Leaderboard;
