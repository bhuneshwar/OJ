import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { 
    Container, Paper, Typography, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow 
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
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: '10px' }}>
                <Typography variant="h4" gutterBottom>Leaderboard</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Rank</strong></TableCell>
                                <TableCell><strong>Username</strong></TableCell>
                                <TableCell><strong>Problems Solved</strong></TableCell>
                                <TableCell><strong>Best Execution Time</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.map((user, index) => (
                                <TableRow key={user.username}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.problemsSolved}</TableCell>
                                    <TableCell>{user.bestTime} ms</TableCell>
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
