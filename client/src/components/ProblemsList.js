import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  TablePagination,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Navbar from './Navbar';
import axiosInstance from '../utils/axios';

function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axiosInstance.get('/problems', { withCredentials: true });
        setProblems(response.data);
        setLoading(false);
      } catch (error) {
        enqueueSnackbar(error.response?.data || 'Error fetching problems', { 
          variant: 'error' 
        });
        if (error.response?.status === 401) {
          navigate('/');
        }
      }
    };

    fetchProblems();
  }, [navigate, enqueueSnackbar]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h2">
          Problems
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="problems table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell align="right">Difficulty</TableCell>
                <TableCell align="right">Acceptance Rate</TableCell>
                <TableCell align="right">Submissions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {problems
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((problem) => (
                  <TableRow
                    key={problem._id}
                    hover
                    onClick={() => navigate(`/problem/${problem._id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell component="th" scope="row">{problem.title}</TableCell>
                    <TableCell align="right">
                      <Chip label={problem.difficulty} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">{problem.acceptanceRate || '0'}%</TableCell>
                    <TableCell align="right">{problem.submissions || 0}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={problems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Container>
    </>
  );
}

export default ProblemsList;
