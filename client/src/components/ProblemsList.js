import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/style.css';

function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const axiosInstance = axios.create({
          baseURL: 'http://localhost:8080',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const response = await axiosInstance.get('/problems');
        setProblems(response.data);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
        setError('Failed to fetch problems. Please try again later.');
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="problems-container">
      {error && <p className="error-message">{error}</p>}
      {problems.length > 0 ? (
        problems.map((problem) => (
          <div key={problem._id} className="problem-item">
            <span className="problem-title">{problem.title}</span>
            <Link to={`/problem/${problem._id}`} className="solve-button">Solve</Link>
          </div>
        ))
      ) : (
        <p>No problems found.</p>
      )}
    </div>
  );
}

export default ProblemsList;
